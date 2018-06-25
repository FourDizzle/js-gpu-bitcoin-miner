#version 300 es

/*
  for WebGL 2.0 only
*/

uniform uint data[32];
uniform uint midstate[8];
uniform uint target[8];
uniform uint nonce_base;
uniform uint H[8];
uniform uint K[64];

uniform uint N;

bool is_pass(uint[] hash) {
  bool pass = false;
  for (int i = 0; i < 8; i++) {
    if (hash[i] < target[i]) {
      pass = true;
      break;
    } else if (hash[i] > target[i]) {
      pass = false;
      break;
    }
  }
  return pass;
}

uint rrot(uint input, int rot) {
  return (input >> rot) | (input << (32-rot));
}

uint[8] sha256(uint[] msg, uint[] startH) {
  uint temp[8];
  for (int i = 0; i < 8; i++) {
    temp[i] = startH[i];
  }

  int chunks = message.length() / 16;
  for (int i = 0; i < chunks; i++) {
    uint w[64];

    for (int j = 0; j < 16; j++) {
      w[j] = msg[j + i*16];
    }

    for (int j = 16; j < 64; j++) {
      uint s0 = rrot(w[j-15], 7) ^ rrot(w[j-15], 18) ^ (w[j-15] >> 3);
      uint s1 = rrot(w[j-2], 17) ^ rrot(w[j-2], 19) ^ (w[j-2] >> 10);
      w[j] = w[j-16] + s0 + w[j-7] + s1;
    }

    uint a = temp[0];
    uint b = temp[1];
    uint c = temp[2];
    uint d = temp[3];
    uint e = temp[4];
    uint f = temp[5];
    uint g = temp[6];
    uint h = temp[7];

    for (int j = 0; j < 64; j++) {
      uint s1 = rrot(e, 6) ^ rrot(e, 11) ^ rrot(e, 25);
      uint ch = (e & f) ^ ((~e) & g);
      uint temp1 = h + s1 + ch + K[i] + w[i]
      uint s0 = rrot(a, 2) ^ rrot(a, 13) ^ rrot(a, 22);
      uint maj = (a & b) ^ (a & c) ^ (b & c);
      uint temp2 = s0 + maj;

      h = g;
      g = f;
      f = e;
      e = d + temp1;
      d = c;
      c = b;
      b = a;
      a = temp1 + temp2;
    }

    temp[0] += a;
    temp[1] += b;
    temp[2] += c;
    temp[3] += d;
    temp[4] += e;
    temp[5] += f;
    temp[6] += g;
    temp[7] += h;
  }

  return temp;
}

void main() {
  uint nonce;
  uint w[64];
  uint udata[16];
  uint hash[8];

  uint x_off = gl_FragCoord.x;

  for (int i=0; i<16; i++) {
      udata[i] = data[i+16];
  }

  udata[19] = nonce_base + x_off;

  hash = sha256(udata, midstate);

  uint temp[16] = uint[](0,0,0,0,0,0,0,0,2147483648,0,0,0,0,0,0,256);
  for (int i = 0; i < 8; i++) {
    temp[i] = hash[i];
  }

  hash = sha256(temp, H);

  if (is_pass(hash)) {
    gl_FragColor = vec4(.0, 1.0, .0, 1.0);
  } else {
    gl_FragColor = vec4(1.0, .0, .0, 1.0);
  }
}
