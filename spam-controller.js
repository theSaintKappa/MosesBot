let spamming = false;
let spamChannel;
let pingReceiver;
let optionalMessage = '';
let comboCounter = 1;

// spam function repeats until variable spamming is false
function spam() {
    return new Promise((resolve, reject) => {
        if (!spamChannel) reject('Channel is undefined!');

        // send message on spam channel
        spamChannel
            .send({ content: `\`x${comboCounter}\` <@${pingReceiver}>${optionalMessage}` })
            .then((msg) => {
                msg.delete();

                comboCounter++;

                // wait 1s until sending next spam message
                setTimeout(() => {
                    // continue spamming if spamming variable is true
                    if (spamming) {
                        spam()
                            .then(resolve) // not entirely necessary, but good practice
                            .catch(console.log); // log error to console in case one shows up
                    }

                    // otherwise, just resolve promise to end this looping
                    else {
                        resolve();
                    }
                }, 1000);
            })
            .catch(console.log);
    });
}

module.exports = {
    setChannel: (channel) => {
        spamChannel = channel;
    },

    setStatus: (statusFlag) => {
        // get current status
        let currentStatus = spamming;

        // update spamming flag
        spamming = statusFlag;

        // if spamming should start, and it hasn't started already, call spam()
        if (statusFlag && currentStatus != statusFlag) {
            spam();
        }
    },

    getStatus: () => {
        return spamming;
    },

    setReceiver: (receiverId) => {
        pingReceiver = receiverId;
    },

    setMessage: (messageArg) => {
        optionalMessage = messageArg;
    },

    getReceiver: () => {
        return pingReceiver;
    },

    resetCombo: () => {
        comboCounter = 1;
    },

    getCombo: () => {
        return comboCounter;
    },
};
