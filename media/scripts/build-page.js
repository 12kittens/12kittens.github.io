'use strict'

// The use of the async keyword should throw an unreachable error
// for older browsers.

let source = document.currentScript? new URL(document.currentScript.src) : null

function relative(path) {
    return new URL(path, source).href
}

const navUrls = [
    { tag: 'Home', url: '../../' },
    { tag: 'Projects', url: '../../projects/' },
    { tag: 'Games', url: '../../games/' },
    { tag: 'Articles', url: '../../articles/' },
    { tag: 'Gallery', url: '../../gallery/'},


]

function checkSameUrl(urlA, urlB) {
    if(urlA.endsWith('index.html')) {
        urlA = urlA.substring(0, urlA.length - 'index.html'.length)
    }
    if(urlB.endsWith('index.html')) {
        urlB = urlB.substring(0, urlB.length - 'index.html'.length)
    }
    console.log(new URL(urlA).toString() == new URL(urlB).toString(), urlA, urlB)
    return new URL(urlA).toString() == new URL(urlB).toString()
}

async function setup() {
    console.log('Building...')
    const compatWarning = document.getElementById('compatibility-warning')
    const compatNavbar = document.getElementById('compatibility-navbar')
    if(compatWarning) {
        compatWarning.parentElement.removeChild(compatWarning)
    } 
    if(compatNavbar) {
        compatNavbar.parentElement.removeChild(compatNavbar)
    }

    document.body.classList.add('no-margin')

    const root = document.getElementById('root')

    const headerWrapper = document.createElement('div')
    {
        const headerImg = document.createElement('div')
        headerImg.classList.add('header-img')
        headerWrapper.appendChild(headerImg)
    }
    headerWrapper.classList.add('header-wrapper')

    const headerBar = document.createElement('div')
    headerBar.classList.add('header-bar')

    const leftUrls = document.createElement('div')
    leftUrls.classList.add('header-bar-left-nav')

    const rightUrls = document.createElement('div')
    rightUrls.classList.add('header-bar-right-nav')

    const mobileUrls = document.createElement('div')
    mobileUrls.classList.add('header-mobile-urls')

    const mobileMenuButton = document.createElement('button')
    mobileMenuButton.classList.add('header-mobile-menu-button')
    mobileMenuButton.textContent = '+'
    for(const n in navUrls) {
        const buttonData = navUrls[n]
        const item = document.createElement('a')
        {
            const tag = document.createElement('div')
            tag.textContent = buttonData.tag
            tag.classList.add('header-bar-button-tag')
            item.appendChild(tag)
            if(checkSameUrl(window.location.href, relative(buttonData.url))) {
                item.classList.add('selected')
                const selectedBar = document.createElement('div')
                selectedBar.classList.add('header-bar-button-selected-bar')
                item.appendChild(selectedBar)
            } else {
                console.log(relative(buttonData.url).toString(), new URL(window.location.href).toString())
            }
        }
        item.classList.add('header-bar-button')
        item.href = relative(buttonData.url)
        if(n % 2 == 0) {
            leftUrls.appendChild(item)
        } else {
            rightUrls.appendChild(item)
        }
        const cloned = item.cloneNode(true)
        mobileUrls.appendChild(cloned)
    }

    headerBar.appendChild(leftUrls)
    headerBar.appendChild(rightUrls)
    headerBar.appendChild(mobileMenuButton)

    const headerFloatingLogo = document.createElement('a')
    headerFloatingLogo.classList.add('header-floating-logo')

    function changeLogoPosition() {
        const maxScroll = window.innerHeight / 100 * 60
        const scrollFraction = Math.min(window.scrollY / maxScroll, 1)
        const top = ((1 - scrollFraction) * (window.innerHeight / 100 * 30 - 50)) + 'px'
        const height = ((1 - scrollFraction) * 50 + 50)
        headerFloatingLogo.style.top = top
        headerFloatingLogo.style.height = height + 'px'
        headerFloatingLogo.style.width = height * 3 + 'px'
        leftUrls.style.marginRight = 
        rightUrls.style.marginLeft = ((1 - (1 - scrollFraction) ** 2) * 100) + 'px'

    }

    headerFloatingLogo.href = relative('../../')

    window.addEventListener('scroll', changeLogoPosition)
    window.addEventListener('resize', changeLogoPosition)

    let mobileMenuShow = false
    mobileMenuButton.addEventListener('click', () => {
        mobileMenuShow = !mobileMenuShow
        if(mobileMenuShow) {
            mobileUrls.classList.add('open')
        } else {
            mobileUrls.classList.remove('open')

        }
    })
    changeLogoPosition()

    document.body.prepend(mobileUrls)

    document.body.prepend(headerFloatingLogo)

    document.body.prepend(headerBar)

    document.body.prepend(headerWrapper)

    const noCompatDestroy = document.getElementsByClassName('nocompat-destroy')
    for(const item of noCompatDestroy) {
        console.log(item)
        item.parentElement.removeChild(item)
    }
    const noCompatOnly = document.getElementsByClassName('nocompat-only')
    for(const item of noCompatOnly) {
        console.log(item)
        item.classList.remove('nocompat-only')
    }


}

setup()