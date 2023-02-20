module.exports = async (oldMember, newMember) => {
    if (oldMember.pending === newMember.pending) return;

    console.log(`${newMember.user.username} just accepted the server rules!`);
    newMember.roles.add('980814138869698641');
};
