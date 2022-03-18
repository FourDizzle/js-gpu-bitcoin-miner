# js-gpu-bitcoin-miner
Mines bitcoin in the browser using WebGL to compute the hashes and a server to negotiate the stratum mining protocol and coordinate clients.

I've noticed the smallest amount of attention being paid to this code. Firstly, my appologies; this isn't my best stuff. Secondly, I figured
I ought to some context with the code.

# On Security
This is p old code, and some of the packages it depends on have been found to have some pretty serious security flaws, please address those
before using this.

# On WebGL Mining
As it turns out WebGL is really the wrong tool for this. WebGL, like OpenGL, is optimized for graphics computation and the restrictions of 
glsl in this context are less than ideal for mining. OpenCL allows for parallel computation on the GPU that is better suited to hash computation,
and no browser has ported this for use on the web. I'm having a hard time thinking of a use case other than distributed neural net gradient descent.

This code also includeds a means for accomplishing CPU mining with the option of using a webworker. You'll compute more hashes per second 
using this method.

# On Motivation
Initially this was developed so that I could better understand the in's and out's of crypto-mining, then later as a potential means of 
giving a specific non-profit the ability to benefit from the distributed computing power of donors who, for one reason or another, might
have more to give in CPU cycles than hard cash. As I thought about it, the energy requirements of participating in proof-of-work 
cryptocurrency kinda felt like speculating on the value of life prior to the worst of the climate-crisis. That and many other less-than-savory 
features of the currencies and the community around them deterred me from putting this code to any real use.

# On the Ethics of Crypto-Mining in the Browser
Obviously, mining cryptocurrency on another's computer without their informed consent is wrong. Given that very few people understand what
crypto mining entails, anyone putting this to use should bear the burden of educating their userbase. Anything less than making everyone 
involved aware of what is happening, who is benefitting, at what cost, and who is paying that cost, is exploitation. Please don't do that.
Tbh, please don't participate in crypto-currency in general.
