/**
 * 时钟画图
 */
;(function($,doc,win){
	var clock=function(ele){
		this.dom=ele;
		this.defaults={
			type:"normal"
		};
		this.style={
			width:$(this.dom).width(),
			height:$(this.dom).height(),
			min:$(this.dom).width()<$(this.dom).height()?$(this.dom).widthv():$(this.dom).height()
		};
		this.center={
			x:this.style.width/2,
			y:this.style.height/2
		}
		var param=$(ele).attr("data");
		if(param!=undefined){
			var obj=JSON.parse();
			if(obj){
				this.defaults=$.extend(this.defaults,obj)
			}
		}
		this._init_()
	}
	clock.prototype={
		_init_:function(){
			this._initStyle_()
			this._initLoadCanvs_()
			this._initLoadDynamicCanvs_()
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
			_this_._initLoadClock();
		},
		_initLoadDynamicCanvs_:function(){   //动态仪表盘
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
		_initLoadClock:function(){
			if(this.defaults.type=='normal'){
				this._initLoadNorClockBgPanel()
			}
			this._initDynamicEvent()
		},
		_drawRingLine:function(len,angle){   //画时钟的表盘
			var _this_=this
			var ctx=this.content;
			var r=this.style.width*0.8/2
			var x0=this.center.x;
			var y0=this.center.y;
			var x1=x0+Math.cos(angle)*r;
			var y1=y0+Math.sin(angle)*r;
			var x2=x0+Math.cos(angle)*(r-len);
			var y2=y0+Math.sin(angle)*(r-len);
			ctx.moveTo(x1,y1);
			ctx.lineTo(x2,y2);
		},
		_drawHander:function(start,end,angle,w,color,tx){   //画时钟指针
			var _this_=this
			var ctx=this.pcontent;
			var r=this.style.width*0.8/2
			var x0=this.center.x;
			var y0=this.center.y;
			var x1=x0+Math.cos(angle)*start;
			var y1=y0+Math.sin(angle)*start;
			var x2=x0+Math.cos(angle)*end;
			var y2=y0+Math.sin(angle)*end;
			ctx.lineWidth=w
			ctx.strokeStyle=color
			ctx.beginPath()
			ctx.moveTo(x1,y1);
			ctx.lineTo(x2,y2);
			ctx.closePath()
			ctx.stroke()
			ctx.restore()
			if(tx!=undefined && tx!=''){
				ctx.fillStyle="#7FFF00"
				ctx.fillText(tx,x2,y2)
			}
			ctx.lineWidth=1
		},
		_initLoadNorClockBgPanel:function(){
			var len=[10,5,5]
			for(var i=0;i<12;i++){
				var index=i-parseInt(i/3)*3;
				this._drawRingLine(len[index],i*30*2*Math.PI/360)
			}
			this.content.stroke()
		},
		_drawHMShand:function(date){
			var _this_=this;
			var r=this.style.width*0.8/2;
			var hour=date.getHours();
			var min=date.getMinutes();
			var sec=date.getSeconds();
			var h=hour-parseInt(hour/12)*12
			var color="#00FFFF";
			var angs=(sec-15)*6*2*Math.PI/360;
			var angM=(min-15)*(360/60)*2*Math.PI/360+(sec/60)*6*2*Math.PI/360;
			var angH=(h-3)*(360/12)*2*Math.PI/360+(min/60)*(360/12)*2*Math.PI/360+(sec/60)*(360/(12*60))*2*Math.PI/360
			_this_._drawHander(0-r*0.2,r,angs,1,color,sec)
			
			_this_._drawHander(0,r*0.8,angM,2,color,min)
			_this_._drawHander(0,r*0.6,angH,3,color,hour)
			_this_.pcontent.stroke()
		},
		_initDynamicEvent:function(){
			var _this_=this;
			window.setInterval(function(){
				$(_this_.canvp).attr("width",_this_.style.width)
				if(_this_.defaults.type=='normal'){
					_this_._drawHMShand(new Date())
				}
				
			},1000)
		}
		
	}
	clock.init=function(eles){
		var list=[];
		$.each(eles, function() {
			list.push(new clock(this))
		});
		return list;
	}
	window["clock"]=clock;
})(jQuery,document,window)
