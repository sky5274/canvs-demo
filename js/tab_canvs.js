/**
 * 柱状图与折线图
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
	
	
	var tab=function(ele){
		this.dom=ele;
		this.padscale=0.2;
		this.axix_margin=20;
		this.option={
			title:{text:"",subText:""},
			lenged:{data:[]},
			xAxis:[{data:[]}],
			yAxis:[{
				type: 'value',
				name: '',
				axisLabel: {
					formatter: '{value}'
				}
			}],
			series:[]
		};
		this.style={
			width:$(this.dom).width(),
			height:$(this.dom).height()
		};
		var min=$(this.dom).width()<$(this.dom).height()?$(this.dom).widthv():$(this.dom).height()
		this.padding=min*this.padscale;
		this.arrow={width : 4,height : 15}
		this.stepXArr=[];
		this.axis={
			x0:this.padding,
			y0:$(this.dom).height()-this.padding,
			y1:$(this.dom).height()-this.padding,
			y2:this.padding+this.arrow.height,
			w:$(this.dom).width()-this.padding*2-this.arrow.height,
			h:$(this.dom).height()-this.padding*2-this.arrow.height,
			yStep:5
		}
		this.scale={
			x:10,
			y:10
		};
		this.defaults={
			padding:this.padding,
			minbar:10,
			w:$(this.dom).width()-this.padding*2-this.arrow.height,
			h:$(this.dom).height()-this.padding*2-this.arrow.height
		}
		this.posObj={}
		this.initObj=[]
		
		this.color=['#7FFFD4','#FFE4C4','#8A2BE2','#7FFF00','#5F9EA0','#FF7F50',
		'#6495ED','#E9967A','#ADFF2F','#6B8E23','#B0E0E6','	#6A5ACD','#4682B4','#D02090']
		this._init_()
	};
	
	tab.prototype={
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
			_this_._initCanvsP()
			_this_._initEvent()
			_this_._initTipCantainer()
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
		_getPosObject:function(x,y){       //根据坐标获取对象
			var list=[];
			$.each(this.initObj,function(i,p){
				if(p._isInPainter(x,y)){  //判断绘图对象的坐标是否包含鼠标的坐标
					list.push(p.defaults)
				}
			})
			return list;
		},
		_getObjectArea:function(obj){     //根据对象的属性获取器在画布上区域
			
		},
		_clearTipCantainer:function(){    //清空提示
			this.mark.hide()
			this.tip.hide()
			this.tip.html("")
		},
		_initEvent:function(){
			var _this_=this;
			this.event_move={
				index:0,
				flag:false
			}
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
        		if(x>_this_.axis.x0&&x<_this_.axis.x0+_this_.axis.w&& y<_this_.axis.y1&&_this_.axis.y2){
        			_this_._drawAxisHelpLine(x,y);
        			_this_._showMark()
        			_this_._showTip(e.clientX,e.clientY)
        			for(var i=0;i<_this_.stepXArr.length;i++){
        				if(_this_.stepXArr[i]>x ){
        					if(_this_.event_move.index!=i-1){
        						_this_.event_move={
        							index:i-1,flag:true
        						}
        					}
        					break;
        				}else{
        					_this_.event_move.flag=false;
        				}
        			}
        			if(_this_.event_move.flag){
//      				console.log("result："+_this_.event_move.index)
        			}
        		}else{
        			_this_._clearTipCantainer()
        			_this_._clearAxisHelpLine();
        		}
			})
		},
		_getxAxlixIndex:function(e){
			var _this_=this;
			/**
				 * 计算鼠标在canvs中的位置
				 */
				var x = e.clientX-$(_this_.dom).offset().left;
        		var y = e.clientY-$(_this_.dom).offset().top;
        		var index=null;
        		if(x>_this_.axis.x0&&x<_this_.axis.x0+_this_.axis.w&& y<_this_.axis.y1&&_this_.axis.y2){
        			_this_._drawAxisHelpLine(x,y);
        			for(var i=0;i<_this_.stepXArr.length;i++){
        				if(_this_.stepXArr[i]>x ){
        					index=i-1;
        					break;
        				}
        			}
        		}
        	return index;
		},
		_getxAxlisInfo:function(index){   //显示X轴的信息与在canvs的范围
			var _this_=this;
			var info={};   //信息体
			info.name=_this_.option.xAxis[0].data[index]
			info.series=[];
			$.each(_this_.option.series,function(i,ser){
				var s={};
				s.name=ser.name;
				s.value=ser.data[index];
				info.series.push(s)
			})
			return info;
		},
		_showTip:function(x,y){
			var _this_=this;
			var index=_this_.event_move.index;
			var info=_this_._getxAxlisInfo(index);
			_this_.tip.html("")
			_this_.tip.append($("<h3>"+info.name+"</h3>"))
			$.each(info.series,function(i,ser){
				_this_.tip.append($("<span>"+ser.name+":"+ser.value+"</span><br>"))
			})
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
		_showMark:function(){
			var _this_=this;
			var index=_this_.event_move.index;
			var w=_this_.axis.xslen;
			var h=_this_.axis.y1-_this_.axis.y2;
			var x=_this_.stepXArr[index]+$(_this_.dom).offset().left;
			var y=_this_.axis.y2+$(_this_.dom).offset().top;
			_this_.mark.css({
				"display":"block",
				"z-index":2,
				"height":h,
				"width":w,
				"left":x,
				"top":y
			})
		},
		_drawAxisHelpLine:function(x,y){  //画坐标系辅助线
			var _this_=this;
			var ctx=_this_.pcontent;
			this._clearAxisHelpLine();
			var con=this.option.xAxis[0].data[this.event_move.index]+":"+this._getValueByyAxlis(y)
			ctx.moveTo(_this_.axis.x0,y)
			ctx.lineTo(x,y)
			ctx.lineTo(x,_this_.axis.y0)
			ctx.fillText(con,x, y+14);
			ctx.stroke()
		},
		_clearAxisHelpLine:function(){
			$(this.canvp).attr("width",this.style.width)
		},
		_drawAxis:function(){  //画x,y轴
			this._drawXAxis()
			this._drawYAxis()
		},
		_drawXAxis:function(){  //画X轴
			var _this_=this;
			var ctx=_this_.content;
			ctx.lineWidth = 0.5;
			ctx.strokeStyle="#A9A9A9";
			ctx.beginPath();
			var x=_this_.axis.x0;
			var y=_this_.axis.y0;
			var x_w=_this_.axis.w
			ctx.moveTo(x,y);
			ctx.lineTo(x+x_w,y);
			
			//画x轴  的标签
			var variabtes=_this_.option.xAxis[0].data;
			var vsize=variabtes.length;
			var vstep=(x_w-_this_.axix_margin)/(vsize);
			_this_.axis.xslen=vstep
			for(var i=1;i<=vsize;i++){
				ctx.font = "normal normal bold 14px 微软雅黑";
            	ctx.fillStyle = "#285ea6";
            	var s_x=x+ vstep*(i-0.5)-variabtes[i-1].length*(14/2)   //居中显示
            	ctx.fillText(variabtes[i-1],s_x, y+14);
            	_this_.stepXArr.push(x+vstep*(i-1));    //记录X轴的个元素的起始位置
			}
			for(var i=1;i<vsize+1;i++){  //画X轴分割线
				ctx.moveTo(x+ vstep*i,y);
				ctx.lineTo(x+ vstep*i,y+6);
			}
			ctx.closePath();
			ctx.stroke()
			_this_._drawArrow(x+_this_.axis.w,y,false)
			
			_this_._drawXAxisData()   //绘画x轴对应的数据
		},
		_drawXAxisData:function(){     //画X轴对应的数据
			var _this_=this;
			this.color_index=0
			var ctx=_this_.content;
			$.each(this.defaults.type, function(type,list) {
				if(type=='bar'){
					_this_._drawBar(list)
				}else if(type="line"){
					_this_._drawLine(list);
				}
			})
		},
		_drawBar:function(list){   //柱形图
			var bsize=list.length;
			var _this_=this;
			var y=this.axis.y0;
			var x_axis_len=_this_.axis.xslen;
			var x_axis_pad=x_axis_len*_this_.padscale/2;
			var x_axis_act=(x_axis_len-2*x_axis_pad)*(1-_this_.padscale)/bsize;
			var x_axis_margin=0;
			var csize=_this_.color.length;
			if(bsize>1){
				x_axis_act=(x_axis_len-2*x_axis_pad)*(1-_this_.padscale)/bsize;
				x_axis_margin=(x_axis_len-2*x_axis_pad-x_axis_act*bsize)/bsize-1
			}
			$.each(_this_.stepXArr,function(j,x_p){
				$.each(list, function(i,bar) {
					var isize=_this_.color_index+i;
					var index=isize-parseInt(isize/csize)*csize
					var x0=x_p+x_axis_pad
					var x=x0+x_axis_margin*i+x_axis_act*i
					var h=_this_._getyAxlisByValue(bar.data[j]);
					var param={
						id:_this_.initObj.length,x:x,y:y,
						subname:_this_.option.xAxis[0].data[j],
						subindex:j,sername:bar.name,serindex:bar.index,
						nature:"fillrect", w:x_axis_act,h:h,value:bar.data[j]
					}
					var p=new painter(param,_this_.canvp);
					_this_.initObj.push(p)
					_this_._drawRect(x,y,x_axis_act,h,_this_.color[index])
					
				})
			});
			_this_.color_index+=list.length
		},
		_drawRect:function(x,y,w,h,color){   //画长方形
			var _this_=this;
			var ctx=_this_.content;
			ctx.fillStyle=color;
			ctx.fillRect(x,y,w,0-h);
			ctx.fill()
		},
		_drawArc:function(x,y,color){   //画圆
			var _this_=this;
			var ctx=_this_.content;
			ctx.strokeStyle=color;
			ctx.beginPath();
			ctx.arc(x,y,4,0,Math.PI*2,true)
			ctx.closePath()
			ctx.stroke()
		},
		_drawLink:function(arr,color){   //连线
			var _this_=this;
			var ctx=_this_.content;
			ctx.strokeStyle=color;
			ctx.moveTo(arr[0].x,arr[0].y);
			for(var i=1;i<arr.length;i++){
				ctx.lineTo(arr[i].x,arr[i].y);
				var param={
						id:_this_.initObj.length,x:arr[i-1].x,y:arr[i-1].y,
						x1:arr[i].x,y1:arr[i].y,
						nature:"line", r:4
					}
				var p=new painter(param,_this_.canvp);
				_this_.initObj.push(p)
			}
			ctx.stroke()
		},
		_drawLine:function(list){  //折线图
			var _this_=this;
			var x_c=_this_.axis.xslen/2;
			var csize=_this_.color.length;
			var y0=this.axis.y0;
			$.each(list,function(i,line){
				var isize=_this_.color_index+i;
				var index=isize-parseInt(isize/csize)*csize
				var lineArr=[];
				$.each(_this_.stepXArr,function(j,x_p){
					var x=x_p+x_c;
					var y=y0-_this_._getyAxlisByValue(line.data[j]);
					lineArr.push({x:x,y:y})
					_this_._drawArc(x,y,_this_.color[index])
					var param={
						id:_this_.initObj.length,x:x,y:y,
						subname:_this_.option.xAxis[0].data[j],
						subindex:j,sername:line.name,serindex:line.index,
						nature:"arc", r:4,value:line.data[j]
					}
					var p=new painter(param,_this_.canvp);
					_this_.initObj.push(p)
				})
				_this_._drawLink(lineArr,_this_.color[index])
				
			})
			_this_.color_index+=list.length-1
		},
		_drawYAxis:function(){   //画y轴
			var _this_=this;
			var ctx=_this_.content;
			ctx.lineWidth = 0.5;
			ctx.strokeStyle="#A9A9A9";
			ctx.beginPath();
			var x=_this_.axis.x0;
			var y0=_this_.axis.y0;
			var y1=_this_.axis.y1;
			var y2=_this_.axis.y2;
			ctx.moveTo(x,y1);
			ctx.lineTo(x,y2)
			//刻画y轴的标签
			var type=this.option.yAxis[0].type
			var formatter=this.option.yAxis[0].axisLabel.formatter
			var vstep=(y1-y2-this.axix_margin)/_this_.axis.yStep
			
			//y轴标签颜色
			ctx.fillStyle="#DCDCDC";
			for(var i=1;i<=_this_.axis.yimax+1;i++){  //画X轴分割线   并显示标签
				ctx.font = "normal normal bold 14px 微软雅黑";
				ctx.moveTo(x, y0-vstep*i);
				ctx.lineTo(x-6, y0-vstep*i);
				var tx=formatter.replace("{"+type+"}",i*_this_.axis.ysval)
				var offset=x-((tx.length-1)*7)-14-16;  //根据X轴的偏移计算字符串的x轴位置
				ctx.fillText(tx,offset, y0-vstep*i+7);
			}
			
			for(var i=_this_.axis.yimin;i<=0;i++){  //画X轴分割线   并显示标签
				ctx.font = "normal normal bold 14px 微软雅黑";
				ctx.moveTo(x, y0-vstep*i);
				ctx.lineTo(x-6, y0-vstep*i);
				var tx=formatter.replace("{"+type+"}",i*_this_.axis.ysval)
				var offset=x-((tx.length-1)*7)-14-16;    //根据X轴的偏移计算字符串的x轴位置
				ctx.fillText(tx,offset, y0-vstep*i+7);
			}
			
			ctx.font = "normal normal bold 14px 微软雅黑";
            ctx.fillStyle = "#285ea6";
            var text=_this_.option.yAxis[0].name
            var s_x=x-text.length*(14/2)   //居中显示
            ctx.fillText(text,s_x, y2-14);
			ctx.stroke()
			_this_._drawArrow(x,y2,true)
		},
		_drawArrow:function(left,top,flag){  //画箭头
			var ctx=this.content;
			var _this_=this;
			 ctx.beginPath();
	        ctx.moveTo(left,top);
	        if(flag){
	            ctx.lineTo(left+_this_.arrow.width,top);
	            ctx.lineTo(left,top-_this_.arrow.height);
	            ctx.lineTo(left-_this_.arrow.width,top);
	        }else{
	            ctx.lineTo(left,top-_this_.arrow.width);
	            ctx.lineTo(left+_this_.arrow.height,top);
	            ctx.lineTo(left,top+_this_.arrow.width);
	        }
	        ctx.fillStyle = "#666";
	        ctx.fill();
		},
		_getyAxlisByValue:function(value){  //根据值获得对应的偏移像素
			return value*this.axis.yslen/this.axis.ysval;
		},
		_getValueByyAxlis:function(y){
			return parseInt((this.axis.y0-y)*this.axis.ysval/this.axis.yslen);
		},
		_initOption:function(){   //初始化   图表数据
			var series=this.option.series;
			var divide={}
			var vmax=0;
			var vmin=0;
			$.each(series,function(i,val){
				if(divide[val.type]==undefined){
					divide[val.type]=[]
				}
				$.each(val.data,function(j,d){
					if(d>vmax){
						vmax=d
					}
					if(d<vmin){
						vmin=d
					}
				})
				val.index=i
				divide[val.type].push(val)   //对数据所画数据进行分类
			})
			vmax=parseInt(vmax/10+1)*10;
			vmin=parseInt(vmin/10)*10
			var step=parseInt((vmax-vmin)/(10*this.axis.yStep)+1)*10
			var ystep=(this.axis.h-this.axix_margin)/5
			var i=parseInt(vmin/step);
			var j=parseInt(vmax/step);
			if(vmax/step<j){
				j+1
			}
			this.axis.yimax=j
			if(vmin/step<i){
				i-=1
			}
			this.axis.yimin=i
			this.axis.yslen=ystep
			this.axis.ysval=step
			if(vmin<0){
				this.axis.y0+=i*ystep-(this.axix_margin)/2
			}
			this.defaults.vmax=vmax;
			this.defaults.vmin=vmin;
			this.defaults.type=divide;
		},
		setOption:function(option){
			this.option=$.extend(this.option,option)
			this._initOption()
			this._drawAxis()
			
		},
		setStyle:function(style){
			
		},
		getStyle:function(){
			return this.style;
		},
		on:function(method,fun){
			var _this_=this;
			eval('$(_this_.canvp).bind(method,function(e){var index=_this_._getxAxlixIndex(e);fun(index)})')
		}
		
	}
	
	tab.init=function(elem){
		var list=new Array();
		$.each(elem, function() {
			list.push(new tab(this))
		});
		return list;
	}
	window["tab"]=tab
	
})(jQuery,document,window)
