/**
 * @method 定义公共方法
 * @author zhang xuanbin
 * @time   2016/12/14
 */
define('common', [], function(){
	return {
		//判断程序所处的环境，包括移动端还是pc端
	    navUserAgent: function() {
	        var browser = {
	            versions: function() {
	                var u = navigator.userAgent,
	                    app = navigator.appVersion;
	                return { //移动终端浏览器版本信息   
	                    trident: u.indexOf('Trident') > -1, //IE内核  
	                    presto: u.indexOf('Presto') > -1, //opera内核  
	                    webKit: u.indexOf('AppleWebKit') > -1, //苹果、谷歌内核  
	                    gecko: u.indexOf('Gecko') > -1 && u.indexOf('KHTML') == -1, //火狐内核  
	                    mobile: !!u.match(/AppleWebKit.*Mobile.*/), //是否为移动终端  
	                    ios: !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/), //ios终端  
	                    android: u.indexOf('Android') > -1 || u.indexOf('Linux') > -1, //android终端或者uc浏览器  
	                    iPhone: u.indexOf('iPhone') > -1, //是否为iPhone或者QQHD浏览器  
	                    iPad: u.indexOf('iPad') > -1, //是否iPad    
	                    webApp: u.indexOf('Safari') == -1, //是否web应该程序，没有头部与底部 
	                    weibo: u.indexOf('Weibo') > -1 //是否在新浪微博中
	                };
	            }(),
	            isPcOrMobile: function() {
	                if ((browser.versions.mobile || browser.versions.ios || browser.versions.android ||
	                        browser.versions.iPhone) && !browser.versions.iPad) { //此处排除了ipad，ipad暂做pc端适配  
	                    return 'mobile';
	                } else {
	                    return 'pc';
	                }
	            },
	            isTrueMobile: function() {
	                if (browser.versions.mobile || browser.versions.ios || browser.versions.android ||
	                    browser.versions.iPhone || browser.versions.iPad) {
	                    return true;
	                } else {
	                    return false;
	                }
	            },
	            isIosDevice: function() {
	                if (browser.versions.ios || browser.versions.iPhone || browser.versions.iPad) {
	                    return true;
	                } else {
	                    return false;
	                }
	            },
	            isInWeibo: function(){
	                if(browser.versions.weibo){
	                    return true;
	                }else {
	                    return false;
	                }
	            },
	            language: (navigator.browserLanguage || navigator.language).toLowerCase()
	        };

	        return browser;
	    }
	};
});

/**
 * @method 定义页面交互
 * @author zhang xuanbin
 * @time   2016/12/14
 * @desc   涉及到页面上的所有交互
 */
define('loveStory', ['./common'], function(common) {
	var storyTimer = null,
        candyTimer = null,
        weddingsTimer = null,
        zoomTimer = null,
        autoWeddingTimer = null,
        touchTimer = null,
		fw = null,//fireworks实力对象
        clickAudio = document.getElementById('clickAudio'),
        clickPlayed = false,
        weddingAudio = document.getElementById('weddingAudio'),
        weddingPlayed = false,
        fireworksAudio = document.getElementById('fireworksAudio'),
        fireworksPlayed = false;
    return {
        init: function() {
            var _this = this;

            //初始化翻页效果
            _this.initPage(); 
            //初始化打开帘子
            _this.initCurtain();
            //初始化点击事件
            _this.initEvent();
            //手机横屏处理
            if(common.navUserAgent().isTrueMobile()){//是移动端
                if(common.navUserAgent().isPcOrMobile()=='mobile'){//非pad设备
                    //以下注释是为横屏处理的代码增加样式，然后以@media适配横评
                    $('#mask').addClass('flexcontainer');
                }
            }
        },

        initPage: function() {
        	var _this = this;

            $('#pageWrapper').height($(window).height());
            $('.page').height($(window).height());
            Zepto(function($){
                $('.page-wrapper').onePageScroll({
                  sectionContainer: 'section',     
                  easing: 'ease-out',                  
                  animationTime: 1000,             
                  pagination: true,                
                  updateURL: false,                
                  beforeMove: function(index) {

                  },  
                  afterMove: function(index) {
                    if(index==1){
                        fireworksPlayed = false;//婚礼声播放
                        $('.fireworks-audio').click();

                        _this.initCurtain();
                    }
                    if(index==2){
                        $('canvas').remove();
                        _this.initLoveStory();

                        clickPlayed = false;//点击声播放
                        $('.click-audio').click();
                        weddingPlayed = true;//婚礼声暂停
                        $('.wedding-audio').click();
                        fireworksPlayed = true;//婚礼声暂停
                        $('.fireworks-audio').click();
                        
                        $('.left-curtain').removeClass('open-curtain');  
                        $('.right-curtain').removeClass('open-curtain');
                        $('.page1-content').removeClass('show');
                    }else{
                        $('#story').empty();

                        clickPlayed = true;//点击声暂停
                        $('.click-audio').click();
                        clearInterval(storyTimer);
                    }
                    if(index==3){
                        weddingPlayed = false;//婚礼声播放
                        $('.wedding-audio').click();
                        clearTimeout(weddingsTimer);
                        clearInterval(autoWeddingTimer);
                        _this.initPage3();
                    }
                    if(index==4){
                        $('.icons-list ul').empty();
                        $('.ul-wrapper').removeClass('slider');
                        $('canvas').remove();
                        clearInterval(candyTimer);

                        weddingPlayed = false;//婚礼声播放
                        $('.wedding-audio').click();
                        fireworksPlayed = true;//烟花声暂停
                        $('.fireworks-audio').click();
                        $('.wedding-photos li').each(function(index,item){
                            var imgObj = $(item).find('img'),
                                imgSrc = imgObj.attr('data-src');
                            if(!imgObj.attr('src')){
                                imgObj.attr('src',imgSrc);
                            }
                        });
                        $('.page4 .wedding-photos li').addClass('move');

                        weddingsTimer = setTimeout(function(){
                            var firstObj = $('.wedding-photos li').eq(0),
                                firstSrc = firstObj.find('img').attr('src'),
                                firstIndex = firstObj.find('img').attr('data-index');
                            $('.wedding-photos li').removeClass('selected');
                            firstObj.addClass('selected');
                            
                            $('.zoom-img img').css({
                                //'opacity': '1',
                                '-webkit-transition': 'all 1s .2s ease',
                                'transition': 'all 1s .2s ease'
                            });

                            setTimeout(function(){
                                $('.zoom-img').width('100%');
                                $('.zoom-img img').attr({
                                    'src': firstSrc,
                                    'data-index': firstIndex
                                });
                                $('.zoom-img a').addClass('show').css('display','inline-block');
                                $('.zoom-img img').addClass('show');
                            },300);

                            _this.autoShowWeddings();
                        },6600);
                    }else{
                        $('.zoom-img img').removeClass('show').attr({
                            'src': '',
                            'data-index': '',
                            'style': ''
                        });
                        $('.zoom-img a').removeClass('show');
                        $('.page4 .wedding-photos li').removeClass('move');
                    }

                    if(index==5){
                        //显示小落的小图标
                        _this.initDownIcons();
                        fw = new Fireworks();

                        clearTimeout(weddingsTimer);
                        clearInterval(autoWeddingTimer);
                        weddingPlayed = true;//婚礼声暂停
                        $('.wedding-audio').click();
                        fireworksPlayed = false;//烟花声播放
                        $('.fireworks-audio').click();
                    }
                  },  
                  loop: false,//循环滚动                
                  keyboard: true,                  
                  responsiveFallback: false
                });
            });
        },

        initCurtain: function(){
        	var _height = Math.max($(document).height(), $(window).height());
            $('.left-curtain').height(_height).addClass('open-curtain');  
            $('.right-curtain').height(_height).addClass('open-curtain');

            $('.page1-content').height(_height);
            setTimeout(function(){
            	$('.page1-content').addClass('show');
            },1000);

            setTimeout(function(){
            	fw = new Fireworks();
                clickAudio.load();
                weddingAudio.load();
                fireworksAudio.load();

                fireworksPlayed = false;//烟花声播放
                $('.fireworks-audio').click();
            },3000);
        },

        initEvent: function(){
            var _this = this;
            $('.click-audio').on('click', function(e){
                if(!clickPlayed){
                    clickAudio.play();
                    clickPlayed = true;
                }else{
                    clickAudio.pause();
                    clickPlayed = false;
                }
            });
            $('.wedding-audio').on('click', function(e){
                if(!weddingPlayed){
                    weddingAudio.play();
                    weddingPlayed = true;
                }else{
                    weddingAudio.pause();
                    weddingPlayed = false;
                }
            });
            $('.fireworks-audio').on('click', function(e){
                if(!fireworksPlayed){
                    fireworksAudio.play();
                    fireworksPlayed = true;
                }else{
                    fireworksAudio.pause();
                    fireworksPlayed = false;
                }
            });
            //点击心形图案查看大图
            $('.wedding-photos li').on('click', function(){
                clearInterval(autoWeddingTimer);
                $('.zoom-img img').css({
                    //'opacity': '1',
                    '-webkit-transition': 'all 1s .2s ease',
                    'transition': 'all 1s .2s ease'
                });
                $('.zoom-img a').removeClass('show').hide();
                $('.zoom-img img').removeClass('show').attr({
                    'src': '',
                    'data-index': '',
                    'style': ''
                });

                var _src = $(this).find('img').attr('data-mimg'),//当前点击的小图对应的大图
                    dataIndex = $(this).find('img').attr('data-index');

                $('.wedding-photos li').removeClass('selected');
                $(this).addClass('selected');

                $('.zoom-img').width('100%');

                zoomTimer = setTimeout(function(){
                    $('.zoom-img img').attr({
                        'src': _src,
                        'data-index': dataIndex
                    });
                    $('.zoom-img a').addClass('show').css('display','inline-block');
                    $('.zoom-img img').addClass('show');
                },300);

                _this.autoShowWeddings();
            });
            //心形图片关闭查看大图
            $('.zoom-img a').on('click', function(){
                clearTimeout(zoomTimer);
                clearInterval(autoWeddingTimer);
                $(this).removeClass('show').hide();
                $('.zoom-img').width('0');
                $('.wedding-photos li').removeClass('selected');
                $('.zoom-img img').removeClass('show').attr({
                    'src': '',
                    'data-index': '',
                    'style': ''
                });
            });

            //初始化左右滑动图片
            this.initTouchPhotos();
        },

        initTouchPhotos: function(){
            var _this = this,
                touch = null,
                pageX1,pageX2,moveWidth,
                winWidth = $(window).width();

            $('.zoom-img img').on('touchstart', function(e){
                e.preventDefault();

                touch = e.touches[0];
                pageX1 = touch.pageX;
                $('.zoom-img img').css({
                    '-webkit-transition': 'none',
                    'transition': 'none'
                });
            }).on('touchmove', function(e){
                e.preventDefault();

                touch = e.touches[0];
                pageX2 = touch.pageX;
                moveWidth = pageX2 - pageX1;

                $('.zoom-img img').css({
                    'opacity': Math.abs(winWidth - Math.abs(moveWidth))/winWidth
                });
            }).on('touchend', function(e){
                e.preventDefault();
                clearTimeout(touchTimer);
                clearInterval(autoWeddingTimer);

                var imgObj = _this.getBeforeAndNext();
                if(moveWidth > 100){//向右拖放大于100px,则替换上一张图片
                    $('.wedding-photos li').removeClass('selected');
                    imgObj.beforeObj.addClass('selected');
                    $('.zoom-img img').attr({
                        'src': imgObj.beforeSrc,
                        'data-index': imgObj.beforeIndex
                    });
                }else if(moveWidth < -100){//向左拖放,替换下一张图片
                    $('.wedding-photos li').removeClass('selected');
                    imgObj.nextObj.addClass('selected');
                    $('.zoom-img img').attr({
                        'src': imgObj.nextSrc,
                        'data-index': imgObj.nextIndex
                    });
                }

                $('.zoom-img img').css({
                    'opacity': '1',
                    '-webkit-transition': 'all 1s .2s ease',
                    'transition': 'all 1s .2s ease'
                });
                touchTimer = setTimeout(function(){
                    $('.zoom-img img').attr({
                        'src': imgObj.nextSrc,
                        'data-index': imgObj.nextIndex
                    });
                    $('.zoom-img a').addClass('show').css('display','inline-block');
                    $('.zoom-img img').addClass('show');
                },800);

                _this.autoShowWeddings();
            });
        },

        //心形完成后自动加载大图并自动播放
        autoShowWeddings: function(){
            var _this = this;
            $('.zoom-img img').attr('style','');
            clearTimeout(touchTimer);
            autoWeddingTimer = setInterval(function(){
                if(stTimer){
                    clearTimeout(stTimer);
                }
                var stTimer = null;
                $('.zoom-img a').removeClass('show');
                $('.zoom-img img').removeClass('show');

                var imgObj = _this.getBeforeAndNext();
                $('.wedding-photos li').removeClass('selected');
                imgObj.nextObj.addClass('selected');

                $('.zoom-img img').css({
                    //'opacity': '1',
                    '-webkit-transition': 'all 1s .2s ease',
                    'transition': 'all 1s .2s ease'
                });

                stTimer = setTimeout(function(){
                    $('.zoom-img img').attr({
                        'src': imgObj.nextSrc,
                        'data-index': imgObj.nextIndex
                    });
                    $('.zoom-img a').addClass('show').css('display','inline-block');
                    $('.zoom-img img').addClass('show');
                },800);
            },3000);
        },

        //获取前一张和下一张图片对象
        getBeforeAndNext: function(){
            var dataIndex = $('.zoom-img img').attr('data-index'),
                nextSrc = '',//当前点击的小图的下一个大图
                nextIndex = '',//当前点击的小图的下一个的索引
                beforeSrc = '',//当前点击的小图的上一个大图
                beforeIndex = '',//当前点击的小图的上一个的索引
                leftLen = $('.left-heart li').length,//左半边心的图片的数量
                rightLen = $('.right-heart li').length,//右半边心的图片的数量
                obj = null,
                nextObj = null,//当前点击的小图的下一个对象
                beforeObj = null,//当前点击的小图的上一个对象
                _index = dataIndex.split('-')[1];

            if(~dataIndex.indexOf('l-')){
                obj = $('.left-heart li').eq(_index);
                if($(obj).index()===0){//左半边第一个
                    nextObj = $('.right-heart li').eq(0);
                    beforeObj = $('.left-heart li').eq(1);
                    nextSrc = nextObj.find('img').attr('data-mimg');
                    beforeSrc = beforeObj.find('img').attr('data-mimg');
                    nextIndex = 'r-0';
                    beforeIndex = 'l-1';
                }else{
                    nextObj = $('.left-heart li').eq($(obj).index() - 1);
                    nextSrc = nextObj.find('img').attr('data-mimg');
                    nextIndex = 'l-'+($(obj).index() - 1);
                    if($(obj).index()==leftLen-1){//左边最后一个
                        beforeObj = $('.right-heart li').eq(rightLen-1);
                        beforeSrc = beforeObj.find('img').attr('data-mimg');
                        beforeIndex = 'r-'+(rightLen-1);
                    }else{
                        beforeObj = $('.left-heart li').eq($(obj).index() + 1);
                        beforeSrc = beforeObj.find('img').attr('data-mimg');
                        beforeIndex = 'l-'+($(obj).index() + 1);
                    }
                }
            }else if(~dataIndex.indexOf('r-')){
                obj = $('.right-heart li').eq(_index);
                if($(obj).index()==$('.right-heart li').length-1){//右边最后一个
                    nextObj = $('.left-heart li').eq(leftLen-1);
                    beforeObj = $('.right-heart li').eq($(obj).index()-1);
                    nextSrc = nextObj.find('img').attr('data-mimg');
                    beforeSrc = beforeObj.find('img').attr('data-mimg');
                    nextIndex = 'l-'+(leftLen-1);
                    beforeIndex = 'r-'+($(obj).index()-1);
                }else{
                    nextObj = $('.right-heart li').eq($(obj).index() + 1);
                    nextSrc = nextObj.find('img').attr('data-mimg');
                    nextIndex = 'r-'+($(obj).index() + 1);
                    if($(obj).index()===0){//右边第一个
                        beforeObj = $('.left-heart li').eq(0);
                        beforeSrc = beforeObj.find('img').attr('data-mimg');
                        beforeIndex = 'l-0';
                    }else{
                        beforeObj = $('.right-heart li').eq($(obj).index()-1);
                        beforeSrc = beforeObj.find('img').attr('data-mimg');
                        beforeIndex = 'r-'+($(obj).index()-1);
                    }
                }
            }

            return {
                beforeObj: beforeObj,
                beforeSrc: beforeSrc,
                beforeIndex: beforeIndex,
                nextObj: nextObj,
                nextSrc: nextSrc,
                nextIndex: nextIndex
            };
        },

        initLoveStory: function() {
            var strObj = ['相识：2008年，谁都知道发生了很多大事，对于我家来说，也发生了不少事。当时我因为鼻炎做手术，在医院待了半个月，出院回到学校后，因为课程跟不上，就想换个班级，最后在跟两个宏志班老师协商后，我调了班级，也就是这个时候我和你成了相互不认识的同学。', '相知：后来高三那年分班，我们又分到一起，还有幸做了同桌，慢慢地我们有了最纯洁的革命友谊，成了好朋友，一起奋斗在高考最后的征程线上。再后来我们跨入不同的高校，分别开始了自己的高校生活，这期间我们相互帮助，为对方的学业和感情问题出谋划策，成了无话不说的密友。', '相爱：慢慢地在我们各自的生活中出现了很多不如意的问题，但我们没有放弃对方，依然相互鼓励，最终等到了彼此...'];
            for (var i = 1; i <= strObj.length; i++) {
                $('#story').append('<p id="para' + i + '" data-id="' + i + '"></p>');
            }

            var count = 0,//记录当前的段落索引，第一段索引值为0...
                str = strObj[count],//当前段落的文字
                num = 0,//动态截取当前段落的文字数，用于动态显示增加的文字
                temp = '_',//临时记录当前段落的文字，交替显示'_'
                target = 'para1',//段落的id
                dataId = $('#' + target).attr('data-id'),//段落自定义属性，用于指向下一段文字
                len = str.length;//当前段落的文字总数

            storyTimer = setInterval(function() {
                temp = str.substring(0, num);

                if (num % 2 === 0) {
                    $('#' + target).text(temp + '_');
                } else {
                    $('#' + target).text(temp + '');
                }

                if (len == temp.length && count < strObj.length - 1) {
                    count++;
                    num = 0;
                    temp = '_';
                    str = strObj[count];

                    target = 'para' + (Number(dataId) + 1);
                    dataId = $('#' + target).attr('data-id');
                    len = str.length;
                }
                //字数显示完后停止敲击键盘声
                if(Number(dataId) == strObj.length && len == temp.length){
                	$('#clickAudio')[0].pause();
                }

                num++;
            }, 100);
        },

        initPage3: function(){
            $('.ul-wrapper li').each(function(index,item){
                var imgObj = $(item).find('img'),
                    imgSrc = imgObj.attr('data-src');
                if(!imgObj.attr('src')){
                    $(item).find('img').attr('src', imgSrc);
                }   
            });
            $('.ul-wrapper').addClass('slider');
        	var len = $('.page3 li').length,
                liWidth = $('.page3').width() - 24;

        	$('.page3 li').width(liWidth);
        	$('.page3 ul').width((liWidth + 24) * len);

        },

        initDownIcons: function(){
            var _this = this;
            $('.icons-list').css({
                'width': $(window).width(),
                'height': $(window).height()
            });
   
            _this.genIcons();
            candyTimer = setInterval(function(){
                _this.genIcons();
            },4000);
        },

        genIcons: function(){
            var icons = ['http://oisj33nbt.bkt.clouddn.com/xin.png','http://oisj33nbt.bkt.clouddn.com/hua.png',
                            'http://oisj33nbt.bkt.clouddn.com/xi.png','http://oisj33nbt.bkt.clouddn.com/candy-01.png',
                            'http://oisj33nbt.bkt.clouddn.com/candy-02.png','http://oisj33nbt.bkt.clouddn.com/candy-03.png'];
            /*var icons = ['../static/images/icons/xin.png','../static/images/icons/hua.png',
                            '../static/images/icons/xi.png','../static/images/icons/candy-01.png',
                            '../static/images/icons/candy-02.png','../static/images/icons/candy-03.png'];*/
            if($('.icons-list ul li').length>=30){
                for(var j=0; j<20; j++){
                    $('.icons-list ul li').eq(0).remove();
                }
            }

            var num = Math.floor(Math.random()*5) + 5;//随机生成5～10的整数
            var leftArr = [];
            for(var i=0;i<num;i++){
                var rand = Math.floor(Math.random()*6),//生成0～5的随机数，用于随机取icons
                    icon = icons[rand],
                    _left = Math.floor(Math.random()*Number($(window).width()));//随机生成0～window宽度的left值，使小icon随机的地方落下
                var str = '<li data-id="show'+_left+'" style="background: url('+icon+');background-size: cover;"></li>';
                
                $('.icons-list ul').append(str);
                leftArr.push(_left);
                /*$('.icons-list li').eq($('.icons-list li').length-1).css({
                    left: _left+'px',
                    top: $(window).height() + 'px'
                });*/
            }
            //解决手机上因为添加时间问题导致不能出现动画效果
            setTimeout(function(){
                for(var j=0;j<leftArr.length;j++){
                    $('.icons-list li[data-id=show'+leftArr[j]+']').addClass('show'+leftArr[j]);
                    $('.icons-list li.show'+leftArr[j]).css({
                        left: leftArr[j]+'px',
                        top: $(window).height() + 'px'
                    });
                }
            },10);
        }

    };
});
