import '@/style/common.scss';

console.log('loader  page');

$(function(){
    let p = document.createElement('p');
    p.textContent = 'js appended：loader page ';
    document.querySelector('body').appendChild(p);
});