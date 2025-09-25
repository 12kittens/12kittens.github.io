async function setupPage({
    topBar,
    selTab,
}) {

    const bar = `        
    <div id="header-bar-menu-left" class="bar-list">
        <div class="bar-element-wrapper">
            <div class="bar-element">
                <a href="/home/" class="bar-element-anchor">Home</a>
            </div>
            <div class="bar-element-selector"></div>
        </div>
        <div class="bar-element-wrapper">
            <div class="bar-element">
                <a href="/labs/" class="bar-element-anchor">Labs</a>
            </div>
            <div class="bar-element-selector"></div>

        </div>
    </div>
    <div id="header-bar-menu-right" class="bar-list">
        <div class="bar-element-wrapper">
            <div class="bar-element">
                <a href="/gallery/" class="bar-element-anchor">Gallery</a>
            </div>
            <div class="bar-element-selector"></div>

        </div>        
        <div class="bar-element-wrapper">
            <div class="bar-element">
                <a href="/games/" class="bar-element-anchor">Games</a>
            </div>
            <div class="bar-element-selector"></div>
        </div>
    </div>
    `
    topBar.innerHTML = bar;
    console.log(topBar)
    const elements = [...document.getElementsByClassName('bar-element-wrapper')]
    elements.forEach((e) => {
        if(e.children[0].children[0].innerText == selTab) {
            e.classList.add('selected');
        }
    })
    {
        const img = document.getElementById('header-content-img');
        const hbar = document.getElementById('header-bar');
        const hbarml = document.getElementById('header-bar-menu-left');

        img.style.position = 'relative';
        img.style.zIndex = 1;
        function loop() {
            const move = Math.min(window.scrollY, window.innerHeight * 0.6 - 50) / (window.innerHeight * 0.6 - 50)
            img.style.top = 
            (1 - move) * (window.innerHeight * 0.3 - 50) + window.scrollY - 31 + 'px';
            img.style.transform = 'scale(' + (2 - move) / 2 + ')';
            hbar.style.gap = (Math.min(move * 1.2, 1) * 80) + 'px';
            hbarml.style.marginRight = (Math.min(move * 1.2, 1) * 80) + 'px';
        }
        loop()
        window.addEventListener('scroll', loop)
    }
}