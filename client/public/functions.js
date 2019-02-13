window.onload = function () {
 
    var navMobile = document.getElementById("nav-icon1"); 
    var navSlideOut = document.getElementById("side-menu");  

	if (document.getElementById("nav-icon1") != undefined) {
		navMobile.onclick = function () {
			navMobile.classList.toggle("open");
			navSlideOut.classList.toggle("active-side-menu");
		}
	}

	var header = document.getElementById("header"); 
	window.onscroll = function () {
		if (header)
			animateHeader()
	};

	function animateHeader() {
		if (window.pageYOffset <= 0) {
			header.classList.remove("smallHeader");
		} else {
			header.classList.add("smallHeader");
		}
	}  
} 