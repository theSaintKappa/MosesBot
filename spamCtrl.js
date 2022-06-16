let spamming = false;
let spamChannel = undefined;
let pingReceiver = undefined;
let optionalMessage = "";
let comboCounter = 1

// spam function repeats until variable spamming is false
function spam() {
    return new Promise((resolve, reject) => {

        if (!spamChannel)
            reject('Channel is undefined!');

        // send message on spam channel
        spamChannel.send({ content: `\`x${comboCounter}\` <@${pingReceiver}>${optionalMessage}` })
            .then(msg => {
                msg.delete();

                comboCounter++;

                // wait 1.5 s until sending next spam message
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

// public functions
module.exports = {
    // pass in discord.js channel for spam function
    setChannel: function(channel) {
        spamChannel = channel;
    },

    // set spam status (true = start spamming, false = stop spamming)
    setStatus: function(statusFlag) {
        // get current status
        let currentStatus = spamming;

        // update spamming flag
        spamming = statusFlag;

        // if spamming should start, and it hasn't started already, call spam()
        if (statusFlag && currentStatus != statusFlag) {
            spam();
        }
    },

    getStatus: function() {
        return spamming;
    },

    setReceiver: function(receiverId) {
        pingReceiver = receiverId;
    },

    setMessage: function(messageArg) {
        optionalMessage = messageArg;
    },

    getReceiver: function() {
        return pingReceiver;
    }
};