var MySlider = (function(){

    var SingleSlide = (function(){

        function SingleSlide(){

        }

        return SingleSlide;
    })();


    function MySlider( elementSelector ){

        this.container = document.querySelector( elementSelector );
        this.initListeners();
    }

    MySlider.prototype.initListeners = function(){
        this.container.addEventListener( 'wheel', this.changed.bind( this ), false );
    };

    MySlider.prototype.changed = function( event ){

    };

    return MySlider;

})();

var scroller = new MySlider();