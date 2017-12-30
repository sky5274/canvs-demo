/**
 * 画饼图
 */
;(function($,doc,win){
	var painter=function(param,parent){   //绘画对象
		this.parent=parent;
		this.defaults={
			x:0,
			y:0,
			nature:"point"
		}
		this.defaults=$.extend(true, this.defaults, param);
	};
	painter.prototype={
		_isInPainter:function(x,y,cond){  //判断是假设对象否点击
			var _this_=this.defaults;
			var flag=false;
			if(cond==undefined){
				cond=true
			}
			if(_this_.nature=='point'){
				if(_this_.x==x&& _this_.y==y){
					flag=true;
				}
			} else if(_this_.nature=='line'){  //线段
				
			}else if(_this_.nature=='fillrect'){  //填充矩形
				if(x>_this_.x && x<_this_.x+_this_.w ){
					if(_this_.h>0 &&y>_this_.y-_this_.h&& y<_this_.y){
						flag=true
					}else if(_this_.h<0 &&y<_this_.y-_this_.h&& y>_this_.y){
						flag=true
					}
					
				}
			}else if(_this_.nature=='fillarc'){    //填充圆
				
			}else if(_this_.nature=='rect'){      //矩形
				
			}else if(_this_.nature=='arc'){       //圆
				if(x>_this_.x-_this_.r&& x<_this_.x+_this_.r&&
				y>_this_.y-_this_.r&& y<_this_.y+_this_.r){
					flag=true
				}
			}else if(_this_.nature=='arc'){       //折线
				
			}else if(_this_.nature='ring'){
				var x_c=x-_this_.x;
				var y_c=y-_this_.y;
				var len=Math.sqrt(Math.pow(x_c,2)+Math.pow(y_c,2));
				var angs=Math.asin(y_c/len)
				var angc=Math.acos(x_c/len)
				var ang=0;
				if( angs>0){
					ang=angc<angs?angs:angc;
				}else if(angs==0){
					ang=angc>angs?angs:angc;
				}else{
					ang=angc<angs?angs:angc;
					ang=Math.PI*2-ang
				}
				if(len<_this_.r2&& len>_this_.r1 && ang<_this_.ang2&& ang>_this_.ang1){
					flag=true
				}
			}
			return flag;
		},
		on:function(method,fun,flag){
			var _this_=this;
			$(_this_.parent).bind(method,function(e){
				var x=e.clientX-$(_this_.parent).offset().left;
				var y=e.clientY-$(_this_.parent).offset().top
				if(_this_._isInPainter(x,y,flag)){
					fun(_this_)
				}
			})
		}
	}
	
	var pie=function(ele){
		this.dom=ele;
		this.defaults={
			
		};
		this.option={
				    title : {
				        text: '',
				        subtext: '',
				        x:'center'
				    },
				    tooltip : {
				        trigger: 'item',
				        formatter: "{a} <br/>{b} : {c} ({d}%)"
				    },
				    legend: {
				        orient: 'vertical',
				        left: 'left',
				        data: []
				    },
				    series : []
				};
		this.style={
			width:$(this.dom).width(),
			height:$(this.dom).height(),
			min:$(this.dom).width()<$(this.dom).height()?$(this.dom).widthv():$(this.dom).height()
		};
		this.objPos=[]
		this.color=['#7FFFD4','#FFE4C4','#8A2BE2','#7FFF00','#5F9EA0','#FF7F50',
		'#6495ED','#E9967A','#ADFF2F','#6B8E23','#B0E0E6','	#6A5ACD','#4682B4','#D02090']
		this._init_()
	}
	pie.prototype={
		_init_:function(){
			this._initStyle_()
			this._initLoadCanvs_()
		},
		_initStyle_:function(){
			var _this_=this;
			$(_this_).css({
				position:"relative"
			})
		},
		_initLoadCanvs_:function(){
			var _this_=this;
			_this_.canv=$("<canvas ></canvas>");
			_this_.canv_w=_this_.style.width
			_this_.canv_h=_this_.style.height
			$(_this_.canv).appendTo(_this_.dom)
			_this_.content=_this_.canv[0].getContext("2d");
			$(_this_.canv).css({
				position:"absolute","display":"block",
				"left":$(_this_.dom).offset().left,
				"top":$(_this_.dom).offset().top,
				"width":_this_.style.width,"height":_this_.style.height,
				"border":"1px solid red"
			})
			//设置画布的宽高
			$(_this_.canv).attr("width",_this_.style.width)
			$(_this_.canv).attr("height",_this_.style.height)
			this._initTipCantainer();
			this._initCanvsP()
			this._initPieEvent();
		},
		_initCanvsP:function(){  //辅助绘画图层
			var _this_=this;
			_this_.canvp=$("<canvas ></canvas>");
			_this_.canvp_w=_this_.style.width
			_this_.canvp_h=_this_.style.height
			$(_this_.canvp).appendTo(_this_.dom)
			_this_.pcontent=_this_.canvp[0].getContext("2d");
			$(_this_.canvp).css({
				position:"absolute","display":"block",
				"left":$(_this_.dom).offset().left,
				"top":$(_this_.dom).offset().top,
				"width":_this_.style.width,"height":_this_.style.height,
				"z-index":10,"border":"1px solid blue"
			})
			//设置画布的宽高
			$(_this_.canvp).attr("width",_this_.style.width)
			$(_this_.canvp).attr("height",_this_.style.height)
		},
		_initTipCantainer:function(){   //初始化提示容器
			var _this_=this;
			_this_.tip=$("<div class='tab_tiip'></div>")
			_this_.tip.css({
				position:"absolute","border":"1px solid green",
				"font":"normal normal bold 14px 微软雅黑",
				"padding":"20px","line-height": "inherit","display":"none"
			})
			_this_.mark=$("<div class='tab_mark'></div>")
			_this_.mark.css({
				position:"absolute","background-color":"#000","opacity": "0.1",
				"display":"none"
			})
			$(_this_.dom).append(_this_.tip)
			$(_this_.dom).append(_this_.mark)
		},
		_clearTipCantainer:function(){    //清空提示
			var _this_=this;
			$(_this_.canvp).attr("width",_this_.style.width)
			this.mark.hide()
			this.tip.hide()
			this.tip.html("")
		},
		_initPieEvent:function(){   //chart   pie   绘图事件
			var _this_ =this;
			$(_this_.canvp).bind("mouseleave",function(){
				_this_._clearTipCantainer()
        		_this_._clearAxisHelpLine();
			})
			$(_this_.canvp).bind("mousemove",function(e){
				e.preventDefault();
				/**
				 * 计算鼠标在canvs中的位置
				 */
				var x = e.clientX-$(_this_.dom).offset().left;
        		var y = e.clientY-$(_this_.dom).offset().top;
        		var list=_this_._getChartObject(x,y)
        		if(list.length>0){
        			_this_._biggerPie(list[0])
        			_this_._showTip(e.clientX,e.clientY,list[0])
        		}else{
        			_this_._clearTipCantainer();
        		}
        		
			})
		},
		_getObjByMouseEvent:function(e){
			var _this_=this;
			var x = e.clientX-$(_this_.dom).offset().left;
        	var y = e.clientY-$(_this_.dom).offset().top;
        	var list=_this_._getChartObject(x,y)
        	if(list.length>0){
        		return list[0];
        	}else{
        		return false;
        	}
		},
		_getChartObject:function(x,y){     //根据坐标获取元素
			var list=[];
			$.each(this.objPos,function(i,obj){
				if(obj._isInPainter(x,y)){
					list.push(obj.defaults)
				}
			})
			return list;
		},
		_biggerPie:function(obj){      //放大饼图显示部分
			var _this_=this;
			$(_this_.canvp).attr("width",_this_.style.width)
			this._drawPieSimplePainter(obj.r1,obj.r2*1.2,obj.x,obj.y
				,obj.ang1,obj.ang2,obj.color,false)
		},
		_showTip:function(x,y,obj){    //显示提示
			var _this_=this;
			var info=obj;
			_this_.tip.html("")
			_this_.tip.append($("<h3>"+info.subname+"</h3>"))
			_this_.tip.append($("<span>"+info.sername+":"+info.value+"("+info.percent+")"+"</span><br>"))
			$(_this_.tip).find("span").css({
				"font":"normal normal 14px 宋体",
				
			})
			_this_.tip.css({
				"display":"block",
				"z-index":3,
				"left":x,
				"top":y
			})
		},
		_drawPieBypainter:function(obj,flag){
			this._drawPieSimplePainter(obj.r1,obj.r2,obj.x,obj.y
				,obj.ang1,obj.ang2,obj.color,flag)
		},
		_drawPieSimplePainter:function(r1,r2,x,y,angle1,angle2,color,flag){
			if(flag==undefined){
				flag=true
			}
			var _this_=this;
			var ctx=this.content;
			if(!flag){
				ctx=this.pcontent
			}
			ctx.fillStyle=color;
			ctx.beginPath();
			ctx.arc(x,y,r1,angle1,angle2,true);   //arc(x,y,r,start,stop)
			this._drawLineToPoint(x,y,r2,angle2);
			ctx.arc(x,y,r2,angle2,angle1,true);
			ctx.closePath();
			ctx.fill()
		},
		_calPosByRadius:function(x0,y0,r,radius){   //根据圆心，半径 和角度  计算圆上点坐标
			var x=Math.cos(radius)*r+x0;
			var y=Math.sin(radius)*r+y0;
			return {x:x,y:y};
		},
		_drawLineToPoint:function(x0,y0,r,radius){    //连接到  指定点
			var ctx=this.content;
			var x=Math.cos(radius)*r+x0;
			var y=Math.sin(radius)*r+y0;
			ctx.lineTo(x,y);
		},
		_drawMoveToPoint:function(x0,y0,r,radius){    //将点移动到   指定点
			var ctx=this.content;
			var x=Math.cos(radius)*r+x0;
			var y=Math.sin(radius)*r+y0;
			ctx.moveTo(x,y);
		},
		_drawPieData:function(r1,r2,x,y,p){    //加载单个饼图数据
			var ctx=this.content;
			var _this_=this;
			var sum=0;
			var title=p.name;
			$.each(p.data,function(i,d){
				sum+=d.value;
			})
			var list=[];
			var temp=0;
			$.each(p.data,function(i,d){
				var size=_this_.pie_color_index+i;
				var index=size-parseInt(size/_this_.color.length)*_this_.color.length;
				var perc=parseInt(d.value*1000/sum)/10;
				var ang1=temp*2*Math.PI/sum;
				var ang2=(temp+d.value)*2*Math.PI/sum;
				var param={
					id:_this_.objPos.length,x:x,y:y,
					subname:title,value:d.value,percent:perc+"%",
					subindex:i,sername:d.name,serindex:i,
					color:_this_.color[index],
					nature:"ring", r1:r1,r2:r2,ang1:ang1,ang2:ang2
				}
				var p=new painter(param,_this_.canvp);
				_this_.objPos.push(p);
				_this_._drawPieBypainter(p.defaults)
				temp+=d.value;
				
			})
			ctx.fill()
		},
		_drawPieChart:function(list){   //绘画饼图序列
			var _this_=this;
			this.pie_color_index=0;
			$.each(list,function(i,p){
				var r1=0+'';r2='';
				if(typeof(p.radius)=='string'){
					r2=p.radius;
				}else{
					r1=p.radius[0];
					r2=p.radius[1];
				}
				var x=parseInt(p.center[0])
				var y=parseInt(p.center[1])
				if(r1.indexOf('%')>-1){
					r1=parseInt(r1)*_this_.style.min/200
				}
				if(r2.indexOf('%')>-1){
					r2=parseInt(r2)*_this_.style.min/200
				}
				if(p.center[0].indexOf('%')>-1){
					x=x*_this_.style.width/100
				}
				if(p.center[1].indexOf('%')>-1){
					y=y*_this_.style.height/100
				}
				_this_._drawPieData(r1,r2,x,y,p);
				_this_.pie_color_index=p.data.length
			})
		},
		_drawSerise:function(){  //开始绘画序列
			var types=this.defaults.type;
			var _this_=this;
			$.each(types,function(i,list){
				if(i=="pie"){
					_this_._drawPieChart(list)
				}
			})
		},
		_initOption:function(){   //初始化   图表数据
			var series=this.option.series;
			var divide={}
			$.each(series,function(i,val){
				if(divide[val.type]==undefined){
					divide[val.type]=[]
				}
				val.index=i
				divide[val.type].push(val)   //对数据所画数据进行分类
			})
			
			this.defaults.type=divide;
		},
		setOption:function(option){
			this.option=$.extend(true, this.optiont, option);
			this._initOption();
			this._drawSerise()
		},
		on:function(method,fun){
			var _this_=this;
			eval('$(_this_.canvp).bind(method,function(e){var obj=_this_._getObjByMouseEvent(e);fun(obj)})')
		}
	}
	pie.init=function(eles){
		var list=[];
		$.each(eles,function(i,ele){
			list.push(new pie(ele))
		})
		return list;
	}
	window["pie"]=pie
})(jQuery,document,window)
