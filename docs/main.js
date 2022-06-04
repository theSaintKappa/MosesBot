var app = document.querySelector('h1');

var typewriter = new Typewriter(app, {
    loop: false,
    delay: 120,
    cursor: '<span style="color: #08a700;">|</span>'
});

typewriter
    .pauseFor(1250)
    .typeString('Click <a href="https://discord.com/invite/cHs56zgFBy" class="link">here</a> for free <span class="hentai">hentai</span>')
    .pauseFor(150)
    .deleteChars(6)
    .typeString('<span class="quotes">Moses Quotes</span>')
    .pauseFor(500)
    .typeString('<span class="explanation">!</span>')
    .pauseFor(1000)
    .start();