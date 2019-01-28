window.onload = function () {
 
    var navMobile = document.getElementById("nav-icon1"); 
    var navSlideOut = document.getElementById("side-menu");  
  

   if (document.getElementById("nav-icon1") != undefined) {
    navMobile.onclick = function () {
      navMobile.classList.toggle("open");
      navSlideOut.classList.toggle("active-side-menu");
    }
  }

}


$( document ).ready(function() {

	$(window).scroll(function() {
		//console.log($(window).scrollTop())
		$("#heroText").css("backgroundSize", (5 * $(window).scrollTop() + 450) + "px");
		$("#parallaxHero").css("opacity", (-$(window).scrollTop()/2000 +1));

		if ($(window).scrollTop() > 0) { 
			$("#header").addClass("headerAnimate");
			$("#logo").addClass("logoAnimate");
			$(".navBarA").addClass("navBarAnimate");
			$(".hmbSpanA").addClass("nav-iconAnimate");
		} else {
			$("#header").removeClass("headerAnimate");
			$("#logo").removeClass("logoAnimate");
			$(".navBarA").removeClass("navBarAnimate")
			$(".hmbSpanA").removeClass("nav-iconAnimate")
		}
	});

	$("#navBar li").on("click", function() {
		window.scrollTo(0, 0);
	})

    /* Demo purposes only */
	$("figure").mouseleave(
		function() {
		  $(this).removeClass("hover");
		});

});