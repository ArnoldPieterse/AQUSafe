'<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="utf-8">
  <title>GHR</title>
  <meta name="viewport" content="width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=1">' | Out-File -FilePath slides.html
  
  $stringi = '<style>'
  $rawi = Get-Content -Path .\package\swiper-bundle.min.css -Raw
  $stringi += $rawi
  $stringi += '</style>'
  Add-Content -Path slides.html -Value $stringi

$stringf = '
  <style>
    html,
    body {
      position: relative;
      height: 100%;
    }

    body {
      background: #000;
      font-family: Helvetica Neue, Helvetica, Arial, sans-serif;
      font-size: 14px;
      color: #000;
      margin: 0;
      padding: 0;
    }

    .swiper-container {
      width: 100%;
      height: 300px;
      margin-left: auto;
      margin-right: auto;
    }

    .swiper-slide {
      background-size: 100%;
      background-position: center;
    }

    .gallery-top {
      height: 80%;
      width: 60%;
    }

    .gallery-thumbs {
      height: 20%;
      box-sizing: border-box;
      padding: 10px 0;
    }

    .gallery-thumbs .swiper-slide {
      height: 100%;
      opacity: 0.4;
    }

    .gallery-thumbs .swiper-slide-thumb-active {
      opacity: 1;
    }
  </style>
</head>

<body>'
Add-Content -Path slides.html -Value $stringf
Add-Content -Path slides.html -Value '  <div class="swiper-container gallery-top">
    <div class="swiper-wrapper">'
Foreach($file in Get-ChildItem ".\GHR") {
    $stringk = '		<div class="swiper-slide" style="background-image:url(./GHR/'
    $stringk += $file.name
    $stringk += ')"></div>'
    Add-Content -Path slides.html -Value $stringk
}
Add-Content -Path slides.html -Value '	</div>
    <div class="swiper-button-next swiper-button-black"></div>
    <div class="swiper-button-prev swiper-button-black"></div>
  </div>
  <div class="swiper-container gallery-thumbs">
    <div class="swiper-wrapper">'
Foreach($file in Get-ChildItem ".\GHR") {
    $stringk = '		<div class="swiper-slide" style="background-image:url(./GHR/'
    $stringk += $file.name
    $stringk += ')"></div>'
    Add-Content -Path slides.html -Value $stringk
}
$str1 = "'.gallery-thumbs'"
$str2 = "'.gallery-top'"
$str3 = "'.swiper-button-next'"
$str4 = "'.swiper-button-prev'"

$stringn = '	</div>
  </div>

'
Add-Content -Path slides.html -Value $stringn
$stringt = '<script>'
$raw = Get-Content -Path .\package\swiper-bundle.min.js -Raw
$stringt += $raw
$stringt += '</script>'
Add-Content -Path slides.html -Value $stringt

$stringb = '
  <script>
    var galleryThumbs = new Swiper('
$stringb += $str1
$stringb +=', {
      spaceBetween: 10,
      slidesPerView: 4,
      loop: true,
      freeMode: true,
      loopedSlides: 5, //looped slides should be the same
      watchSlidesVisibility: true,
      watchSlidesProgress: true,
    });
    var galleryTop = new Swiper('
$stringb += $str2
$stringb += ', {
      spaceBetween: 10,
      loop: true,
	  autoplay: {
          delay: 300000,
          disableOnInteraction: false,
      },
      loopedSlides: 5, //looped slides should be the same
      navigation: {
        nextEl: '
$stringb += $str3
$stringb += ',
        prevEl: '
$stringb += $str4
$stringb +=',
      },
      thumbs: {
        swiper: galleryThumbs,
      },
    });
  </script>
</body>

</html>'
Add-Content -Path slides.html -Value $stringb