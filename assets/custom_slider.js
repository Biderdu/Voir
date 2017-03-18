// var MySlider = (function(){
//
//     var SingleSlide = (function(){
//
//         function SingleSlide(){
//
//         }
//
//         return SingleSlide;
//     })();
//
//
//     function MySlider( elementSelector ){
//
//         this.container = document.querySelector( elementSelector );
//         this.initListeners();
//     }
//
//     MySlider.prototype.initListeners = function(){
//         this.container.addEventListener( 'wheel', this.changed.bind( this ), false );
//     };
//
//     MySlider.prototype.changed = function( event ){
//
//     };
//
//     return MySlider;
//
// })();
//
// var scroller = new MySlider();
//
// $('#home-slider-panel').on('mousewheel', function (event) {
//
//     var delta = event.originalEvent.deltaY;
//
//     if( !didScroll && ( delta > 0 && slides.last().hasClass('current') || delta < 0 && slides.first().hasClass('current') ) ) {
//         return;
//     }
//
//     if(!didScroll) {
//
//         didScroll = true;
//
//         slides.each(function(index, element) {
//
//             if($(element).hasClass('current')) {
//
//                 if(delta > 0 && ((index + 1) < slides.length)) {
//                     slides.eq(index).removeClass('current').addClass('prev');
//                     slides.eq(index + 1).removeClass('next').addClass('current');
//                 }
//
//                 if(delta < 0 && (index > 0)) {
//                     slides.eq(index).removeClass('current').addClass('next');
//                     slides.eq(index - 1).removeClass('prev').addClass('current');
//                 }
//
//                 return false;
//
//             }
//
//         });
//     }
//
//     //autoscroll fix
//     var docViewTop = $(window).scrollTop();
//     var docViewBottom = docViewTop + $(window).height();
//
//
//     sconfig.sliderBelow = ( delta > 0 ) && ( docViewBottom > (sliderElemTop + 100 )) && ( docViewBottom < sliderElemBottom - 20);
//     sconfig.sliderAbove = ( delta < 0 ) && ( docViewTop < (sliderElemBottom + 100 )) && ( docViewTop > sliderElemTop + 20);
//
//     if( sconfig.sliderBelow || sconfig.sliderAbove ) {
//         sconfig.state = 'locked';
//
//         $("html, body").animate({
//             scrollTop: sliderElemTop
//         }, 500, function(){
//             sconfig.state = 'enabled';
//         });
//
//         event.stopPropagation();
//         event.preventDefault();
//     }
//
//
//     event.stopPropagation();
//     event.preventDefault();
//
// });