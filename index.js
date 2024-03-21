var startAfter;
var gridFill = Math.floor((document.documentElement.clientWidth + 20)/200)
var reasonObject = {'welcome-objekt':'웰컴 오브젝트','challenge-reward':'이벤트 보상으로 받은 오브젝트','used-for-grid':'그리드에 사용된 오브젝트','mint-pending':'민팅되지 않은 오브젝트'}
var paramList = ['sort','className','member','season','transferable']
var scrollToggle = true;
var noHasNext = false;
var limit;

async function funcRun() {
    startAfter = 0
    scrollToggle = true
    noHasNext = false
    $('.element').remove()
    limit = $('#input-limit').val()
    var object = await funcFetch()
    //address,sort,startAfter,className,member,season,transferable
    
    funcAppend(object.objekts)
    scrollToggle = false
    startAfter += parseInt(limit)
}

async function funcNext() {
    limit = $('#input-limit').val()
    console.log(startAfter)
    // var address = '0x2DC568e13A76469a4ea59E702B678289f3428387'
    var object = await funcFetch()
    //address,'newest',startAfter,0,0,0,0
    
    funcAppend(object.objekts)
    startAfter += parseInt(limit)
}

async function cosmoIdSearch(id) {
    var data = await fetch('https://api.cosmo.fans/user/v1/by-nickname/'+id)
    var json = await data.json()
    return json.profile.address
}

async function lenticularSearch(id) {
    var data = await fetch('https://api.cosmo.fans/objekt/v1/token/'+id)
    var json = await data.json()
    return json.name
}

//address,sort,start,className,member,season,transferable
async function funcFetch() {
    var addressPromise = $('#input-address').val()
    var address = addressPromise ? (addressPromise.slice(0,2) == '0x' ? addressPromise : await cosmoIdSearch(addressPromise)) : '0x2DC568e13A76469a4ea59E702B678289f3428387'
    for (item of paramList) {
        eval(`var ${item} = $('#input-${item}').val()`)
    }

    var url = `https://api.cosmo.fans/objekt/v1/owned-by/${address}?sort=${sort}&start_after=${startAfter}&limit=${limit}`
    if (className) {
        url += `&class=${className}`
    }
    if (member) {
        url += `&member=${member}`
    }
    if (season) {
        url += `&season=${season}`
    }
    if (transferable) {
        url += `&transferable=${transferable}`
    }
    var data = await fetch(url)
    var json = await data.json()
    if (!json.hasNext) {
        noHasNext = true;
    }
    return json
}

async function funcAppend(array) {
    for (item of array) {
        // var nonTransferableReasonElement = ((!item.transferable && ` `) || '')
        let transferText = item.transferable ? '' : `<p class="isTransferable">전송 불가 (${reasonObject[item.nonTransferableReason]})</p>`
        let receivedDt = new Date(item.receivedAt)
        let receivedTextDefault = `${receivedDt.getFullYear()}년 ${receivedDt.getMonth()+1}월 ${receivedDt.getDate()}일`
        let receivedTextExtra = `${receivedDt.getHours()}시 ${receivedDt.getMinutes()}분 ${receivedDt.getSeconds()}초`
        let mintedDt;
        let lenticularWith = item.lenticularPairTokenId ? `<p class="lenticular">렌티큘러 : ${await lenticularSearch(item.lenticularPairTokenId)}</p>` : ''
        if (item.class == 'Special') {
            mintedDt = new Date(item.mintedAt).getDate()
        }
        let textColor = item.textColor
        $('#next-call').before(
            `<div class="element">
                <div class="objekt">
                    <span class="collectionAndSerial" style="color: ${textColor}">
                        <span class="collection">${item.collectionNo}</span>
                        <span class="serial">#${String(item.objektNo).padStart(5,'0')}</span>
                    </span>
                    <img src="${item.frontImage}">
                </div>
                <div class="comment">
                    <p class="info">${item.collectionId} #${item.objektNo}</p>
                    ${mintedDt ? `<p class="comoDate">매달 ${mintedDt}일 1 COMO가 지급됩니다</p>` : ''}
                    <p class="receiveDate">획득일 : ${receivedTextDefault} <span class="receiveTime">${receivedTextExtra}</span></p>
                    ${transferText}
                    ${lenticularWith}
                </div>
            </div>`
        )
    }
}

function toggle(className) {
    eval(`if (typeof ${className}IsHided === 'undefined'){${className}IsHided = true} else {${className}IsHided = !${className}IsHided}`)
    eval(`if (${className}IsHided) {$('#article').addClass('hide-${className}')} else {$('#article').removeClass('hide-${className}')}`)
}

const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
        if (scrollToggle || noHasNext) {
            return
        }
        if (entry.isIntersecting) {
            funcNext()
        }
    });
}, {
    root: null,
    rootMargin: "0px 0px 0px 0px",
    thredhold: 0,
}).observe($('#next-call')[0]);

/* var data = await fetch('https://api.cosmo.fans/objekt/v1/owned-by/0x2DC568e13A76469a4ea59E702B678289f3428387?class=Special&limit=9999')
var json = await data.json()
array = json.objekts.sort((a,b) => {
    return new Date(a.mintedAt).getDate() - new Date(b.mintedAt).getDate()
}) */