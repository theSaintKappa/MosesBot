let spamming = false;
let spamChannel;
let pingReceiver;
let message;
let comboCounter = 1;

// spam function repeats until variable spamming is false
function spam() {
    return new Promise((resolve, reject) => {
        if (!spamChannel) reject('Channel is undefined!');
        if (!pingReceiver) reject('Receiver is undefined!');

        spamChannel
            .send(`\`x${comboCounter}\` <@${pingReceiver}> ${message}`)
            .then((msg) => {
                msg.delete();

                comboCounter++;

                setTimeout(() => {
                    if (!spamming) resolve();
                    else spam().then(resolve).catch(console.log);
                }, 1000);
            })
            .catch(console.log);
    });
}

module.exports = {
    setStatus: (statusFlag) => {
        // get current status
        let currentStatus = spamming;
        // update spamming flag
        spamming = statusFlag;
        // if spamming should start, and it hasn't started already, call spam()
        if (statusFlag && currentStatus != statusFlag) spam();
    },

    setChannel: (channel) => (spamChannel = channel),
    setReceiver: (receiverId) => (pingReceiver = receiverId),
    setMessage: (messageArg) => (message = messageArg),

    resetCombo: () => (comboCounter = 1),

    getStatus: () => spamming,
    getReceiver: () => pingReceiver,
    getCombo: () => comboCounter,
};
