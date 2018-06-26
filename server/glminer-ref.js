function glminer(job, callback) {
    var run = true;

    var next_run = function(job, callback) {
        var nonces_per_pixel = 1;
        var t = job.t === undefined ? 0 : job.t;
        var nonce = job.nonce === undefined ? 0 : job.nonce;
        var threads = width * nonces_per_pixel;
        var curCnt = 0;
        var x = 0;
        var y = 0;
        var n;

        var submit_nonce = function() {
            n = derMiner.Util.to_uint16_array(job.nonce);

            job.data[6] = n[0];
            job.data[7] = n[1];

            var r = [];
            for (var j = 0; j < job.half.length; j++)
                r.push(job.half[j]);
            for (var j = 0; j < job.data.length; j++)
                r.push(job.data[j]);

            var ret = derMiner.Util.toPoolString(r, true);

            job.golden_ticket = ret;
            callback(job);
        }

        while(run) {
            n = derMiner.Util.to_uint16_array(nonce);
            gl.uniform2fv(nonceLoc,  n);
            gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

            if (debug) console.log("w:" + width + " h:" + height);

            gl.readPixels(x, y, width, height, gl.RGBA, gl.UNSIGNED_BYTE, buf);

            for (var i=0; i<buf.length; i+=4) {
                if (debug) {
                    var out = [];
                    out.push(derMiner.Util.byte_to_hex(buf[i]));
                    out.push(derMiner.Util.byte_to_hex(buf[i+1]));
                    out.push(derMiner.Util.byte_to_hex(buf[i+2]));
                    out.push(derMiner.Util.byte_to_hex(buf[i+3]));
                    console.log("rgba("+(i/4)+"): " + JSON.stringify(out));
                }

                if (nonces_per_pixel == 1) {
                    if (buf[i] == 0 &&
                        buf[i+1] == 0 &&
                        buf[i+2] == 0 &&
                        buf[i+3] == 0) {

                        job.nonce = nonce + i * (nonces_per_pixel / 4);
                        submit_nonce();
                    }
                } else {
                    if (buf[i] != 0 ||
                        buf[i+1] != 0 ||
                        buf[i+2] != 0 ||
                        buf[i+3] != 0) {
                        for (var e = 0; e < 4; e++) {
                            for (var r = 7; r >= 0; r--) {
                                if (buf[i + e] & 1 << r) {
                                    var b = (3 - e) * (nonces_per_pixel / 4) + r;
                                    job.nonce = nonce + i * (nonces_per_pixel / 4) + b;
                                    submit_nonce();
                                }
                            }
                        }

                        job.golden_ticket = null;
                    }
                }
            }

            if (nonce >= maxNonce) {
                cb(null);
                break;
            }

            nonce+= threads;
            TotalHashes += threads;

            if (t < (new Date()).getTime()) {
                t = (new Date()).getTime() + reportPeriod;
                job.total_hashes = TotalHashes;
                callback(job);
                TotalHashes = 0;
            }

            if (useTimeout && ++curCnt > maxCnt) {
                curCnt = 0;
                job.nonce = nonce;
                job.t = t;
                var c = function() {
                    next_run(job, callback);
                }
                window.setTimeout(c, 1);
                return;
            }
        }
    }
    var intMessage = function(event) {
        if (!event.data || !event.data.run) {
            run = false;
            console.log("worker: forced quit!");
            return;
        }
    };

    var mine = function(job, callback) {

        gl.uniform2fv(dataLoc, job.data);
        gl.uniform2fv(hash1Loc, job.hash1);
        gl.uniform2fv(midstateLoc, job.midstate);
        gl.uniform2fv(targetLoc, job.target);

        width = canvas.width;
        height = canvas.height;

        buf = new Uint8Array(width * height * 4);

        next_run(job, callback);
        return intMessage;
    }

    var is_golden_hash = function(hash, target) {
        var u1 = derMiner.Util.ToUInt32(hash);
        var u2 = derMiner.Util.ToUInt32(target[6]);

        console.log("worker: checking " + u1 + " <= " + u2);
        return (u1 <= u2);
    }

    return mine(job, callback);
};
