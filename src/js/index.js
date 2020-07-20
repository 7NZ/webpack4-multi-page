import '@/style/common.scss';
import '@/style/index.scss';

console.log('index  page');

$(function() {
  $('body').append('<p> this is jquery appended </p>');
  var mySwiper = new Swiper ('.swiper-container', {
    loop: true, // 循环模式选项
    // 如果需要分页器
    pagination: {
      el: '.swiper-pagination',
    },

    // 如果需要前进后退按钮
    navigation: {
      nextEl: '.swiper-button-next',
      prevEl: '.swiper-button-prev',
    },
  });
});