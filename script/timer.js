export const circle=document.getElementById('circle');

export const time=document.querySelector('.counter');
time.setAttribute('data-target',60);
const target=+time.getAttribute('data-target');
time.textContent=target;

export let stopTimer;

export function reloadTimer(strokeDashofset){
    time.textContent=target;
    if(strokeDashofset===0){
        circle.style.strokeDashoffset=0;
    }
}

export const NumberCounter = () => {
    let startTime;
    const animate = (timestamp) => {
        stopTimer= requestAnimationFrame(animate);
        const value = +time.textContent;       
        if (!startTime) {
            startTime = timestamp;
        }       
        const elapsed = timestamp - startTime;
        if (elapsed >= 1000) {
            time.textContent = Math.ceil(value - 1);
            startTime = timestamp;
        }
    };
   requestAnimationFrame(animate);
};
