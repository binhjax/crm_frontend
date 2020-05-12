AppBase.module('sugarHome').moduleRequires('ui-controls').init(function(App){var originalLayout=null;var addDlg=null;var leftColumnInnerHTML=null;var leftColObj=null;var maxCount;var warningLang;var pendingRetrieve=[];var dashletWidth={};var refreshPending=false;var delayedRefresh={};var Home=this;var Dom=App.dom;var UI=App.ui;var Wrap=Dom.elementOrId;var Animation=App.animation.Animation;var draggingEl;var lastOverDashlet;this.initEdit=function(){this.setup();this.showSlider();this.initDragTarget();}
this.setup=function(){this.elt=$('dashboard_columns');}
this.getLayout=function(asString){var columns=[];for(var je=0;;je++){var dashlets=$('dash-col-'+je);if(!dashlets)
break;var dashletIds=[];for(var wp=0;wp<dashlets.childNodes.length;wp++){if(typeof dashlets.childNodes[wp].id!='undefined'&&dashlets.childNodes[wp].id.match(/dashlet-[\w-]*/)){dashletIds.push(dashlets.childNodes[wp].id.replace(/dashlet-/,''));}}
if(asString)columns.push(dashletIds.join(','));else columns.push(dashletIds);}
if(asString)return columns.join('|');return columns;}
this.getDashletPosition=function(eltId){var id=eltId.replace(/dashlet-/,'');var layout=this.getLayout();var self=this;for(var colIdx=0;colIdx<layout.length;colIdx++){var col=layout[colIdx];for(var rowIdx=0;rowIdx<col.length;rowIdx++){if(col[rowIdx]==id){return[colIdx,rowIdx];}}}}
this.saveLayout=function(order){var success=function(data){UI.showStatus(app_string('LBL_SAVED_LAYOUT'),2000);}
var layout=App.session.dashboard_id;var req=new App.conn.JSONRequest('save_layout',{status_msg:App.language.get('Home','LBL_SAVING_LAYOUT')},{module:'Dashboard',record:layout,layout:order});req.fetch(success);}
this.uncoverPage=function(id){Home.hideConfigure();Home.retrieveDashlet(Home.configureDashletId);}
this.configureDashlet=function(id,title){Home.configureDashletId=id;var layout=App.session.dashboard_id;if(App.session.dashboard_edit)layout+='&edit=page';Home.configureDlg=App.popups.openUrl('async.php?module=Home&action=ConfigureDashlet&id='+id+'&layout='+layout,null,{width:'604px',title_text:title,resizable:false});}
this.hideConfigure=function(){if(Home.configureDlg)Home.configureDlg.close();}
this.calcDashletWidth=function(id){var outer=$('dashlet-body-'+id);if(outer){var size=UI.getEltRegion(outer);if(size)return parseInt(size.width)-2;}
return'';}
this.retrieveDashlet=function(id,url,callback,dynamic,refresh){var multi,postData=[],idx;if(!url){url='async.php?action=DisplayDashlet&module=Home';if(Array.isArray(id)){for(idx=0;idx<id.length;idx++){postData.push('id[]='+id[idx]);postData.push('width[]='+Home.calcDashletWidth(id[idx]));}
multi=true;}else{postData.push('id='+id);postData.push('width='+Home.calcDashletWidth(id));}}
if((pid=App.session.dashboard_id))
url+='&layout='+pid;if(dynamic)
url+='&dynamic=true';if(refresh)
url+='&refresh=true';if(this.layoutMode)
url+='&sample=true';if(this.retrieveParams){if(Array.isArray(this.retrieveParams))
postData.pushArray(this.retrieveParams);else
url+=this.retrieveParams;}
postData=postData.join('&');var outer_div={},found={},body;var ids=id;if(!multi)
ids=[ids];for(idx=0;idx<ids.length;idx++){var did=ids[idx];outer_div[did]=$('dashlet-'+did);if(outer_div[did])
found[did]=1;else{console.error('Dashlet not found dashlet-'+did);continue;}
if(outer_div[did].style.position!='absolute')
App.util.maskDiv(outer_div[did],did);body=$('dashlet-body-'+did);if(body&&!body.childNodes.length){body.appendChild(createElement2('div',{style:'padding: 0.25em'},App.util.waitIcon()));}}
var fillInDashlet=function(dashlet_id,response){if(!found[dashlet_id])return;outer_div[dashlet_id].innerHTML=App.util.disableInlineScripts(response);App.util.evalScript(response);}
var handleResponse=function(data){if(data){if(!multi)
fillInDashlet(ids[0],data.responseText);else{var text=data.responseText;var start=text.search(/\{#-(.*?)-#}/);while(start>=0){var end=text.search('-#}');var id=text.substring(3,end);text=text.substring(end+3);var next=text.search(/\{#-(.*?)-#}/);var body;if(next>=0){body=text.substring(0,next);text=text.substring(next);start=0;}else{body=text;start=next;}
fillInDashlet(id,body);}}}
if(callback)callback();}
App.conn.asyncRequest(url,{status_msg:mod_string('LBL_LOADING_DASHLETS'),postData:postData},handleResponse);return false;}
this.refreshDashlet=function(id,url,callback,dynamic){this.retrieveDashlet(id,url,callback,dynamic,true);}
this.initDashletAutoRefresh=function(id,interval){if(interval>0){var one_min_in_ms=60000;var interval_ms=interval*one_min_in_ms;if(delayedRefresh[interval_ms])
delayedRefresh[interval_ms].push(id);else{delayedRefresh[interval_ms]=[id];setTimeout(function(){Home.checkAutoRefresh(interval_ms);},1000);}}}
this.checkAutoRefresh=function(delay){var pg=App.themes.page_info,layout=pg&&pg.state&&pg.state.context==='dashboard'&&pg.state.layout,ids=delayedRefresh[delay];delete delayedRefresh[delay];if(!layout||!pg)return;if(ids.length){setTimeout(function(){var pg2=App.themes.page_info;if(!pg2||!pg2.state||pg2.state.layout!==layout){return;}
Home.retrieveDashlet(ids,null,null,false,true);},delay-1000);}}
this.fetchPendingDashlets=function(){if(pendingRetrieve.length){var dlets=pendingRetrieve;pendingRetrieve=[];this.retrieveDashlet(dlets,null,null,false,refreshPending);}}
this.pendingDashlet=function(id,refresh){pendingRetrieve.push(id);App.onDomReady(
function(){setTimeout(function(){Home.fetchPendingDashlets();},200);});refreshPending=refresh;}
this.focusDashletFilter=function(id){UI.focusInput(id+'-FilterForm','filter_text');}
this.showDashletFilter=function(id){var vis=Dom.queryId(id+'-FilterForm').closest('.dashlet-header').toggle();if(vis.css('display')!=='none')
this.focusDashletFilter(id);}
this.setDashletFilter=function(id,value){this.retrieveParams='&filter_value_'+id+'='+encodeURIComponent(value);this.refreshDashlet(id,'',function(){Home.focusDashletFilter(id);});}
this.deleteDashlet=function(id){if(confirm(App.language.get('Home','LBL_REMOVE_DASHLET_CONFIRM'))){var del=function(){var success=function(data){var dashlet=$('dashlet-'+id);dashlet.parentNode.removeChild(dashlet);UI.showStatus(App.language.get('Home','LBL_REMOVED_DASHLET'),2000);}
var layout=App.session.dashboard_id;var req=new App.conn.JSONRequest('remove_dashlet',{status_msg:App.language.get('Home','LBL_REMOVING_DASHLET')},{module:'Dashboard',record:layout,dashlet_id:id});req.fetch(success);}
var height=Wrap('dashlet-'+id).bounds().height;var anim=new Animation().distribute(20,function(percent){return{height:((100-percent)/100*height)+'px'}}).duration(500).timing('ease-out').onEnd(del)
$('dashlet-'+id).style.overflow='hidden';anim.run('#dashlet-'+id);}
return false;}
this.checkMaxDashlets=function(columns){var numDlets=0;for(var i=0;i<columns.length;i++)
numDlets+=columns[i].length;if(numDlets>=Home.maxCount){alert(App.language.get('Home','LBL_MAX_DASHLETS_REACHED'));return true;}
return false;}
this.addDashlet=function(id){var self=this;var columns=Home.getLayout();if(addDlg)addDlg.close();if(this.checkMaxDashlets(columns))return;var success=function(data){var result=data.getResult();if(!result||result.status!=='ok'){console.error("Bad response on adding dashlet",result);return;}
var colZero=$('dash-col-0'),newDashlet=document.createElement('li'),dashletId=result.id;newDashlet.id='dashlet-'+dashletId;newDashlet.className='noBullet';newDashlet.innerHTML='<div style="position: absolute; top: -1000px; overflow: hidden;" id="dashlet-'+dashletId+'" class="dashlet-outer"></div>';colZero.insertBefore(newDashlet,colZero.firstChild);var dashletEntire=Wrap('dashlet-'+dashletId);dashletEntire.css({position:'relative',height:'0px',top:'0px',overflow:'hidden',marginBottom:'0'
});var finishRetrieve=function(){UI.showStatus(App.language.get('Home','LBL_ADDED_DASHLET'),2000);var height=Wrap('dashlet-outer-'+dashletId).bounds().height;var anim=new Animation().distribute(20,function(percent){return{height:(percent/100*height)+'px'}}).duration(500).timing('ease-out').onEnd(function(){dashletEntire.css({height:'',overflow:'',marginBottom:''
});self.makeDashletDraggable(dashletId);});anim.run(dashletEntire);}
Home.retrieveDashlet(dashletId,null,finishRetrieve,true);}
var layout=App.session.dashboard_id;var req=new App.conn.JSONRequest('add_dashlet',{status_msg:App.language.get('Home','LBL_ADDING_DASHLET')},{module:'Dashboard',record:layout,dashlet_id:id});req.fetch(success);return false;}
this.showDashletsPopup=function(){var columns=Home.getLayout();var layout=App.session.dashboard_id;if(this.checkMaxDashlets(columns))return;if(addDlg){addDlg.show();return false;}
addDlg=new UI.Dialog("dashlet-add",{width:"504px",destroy_on_close:false,title_text:mod_string('LBL_ADD_DASHLETS'),resizable:false});addDlg.fetchContent('async.php?module=Home&action=DashletsPopup&layout='+layout,{},null,true);return false;}
this.doneAddDashlets=function(){$('add_dashlets').style.display='';leftColObj.innerHTML=leftColumnInnerHTML;return false;}
this.postForm=function(theForm,callback){var success=function(data){if(data){callback(data.responseText);}}
App.conn.sendForm(theForm,{status_msg:app_string('LBL_SAVING')},success);return false;}
this.setColumns=function(cols,widths){var layout=App.session.dashboard_id;var reload=function(data){App.util.fetchContentMain('async.php?module=Home&action=index&edit=page&layout='+layout);}
var req=new App.conn.JSONRequest('set_columns',{silent:true},{module:'Dashboard',record:layout,columns:cols,widths:widths});req.fetch(reload);}
this.setColumnWidths=function(widths){this.setColumns(null,widths);}
this.callMethod=function(dashletId,methodName,postData,refreshAfter,callback){var response=function(data){if(refreshAfter)Home.retrieveDashlet(dashletId);if(callback){callback(data.responseText);}}
var layout=App.session.dashboard_id;var post='module=Home&layout='+layout+'&action=CallMethodDashlet&method='+methodName+'&id='+dashletId+'&'+postData;App.conn.asyncRequest(null,{method:'POST',postData:post,status_msg:app_string('LBL_SAVING')},response);}
this.setDashletWidth=function(id,width){dashletWidth[id]=width;}
this.layoutColumns=12;this.showSlider=function(){if(!App.session.dashboard_widths)return;var slider=new UI.MultiSlider('dashboard-slider',{min:0,max:this.layoutColumns,rounded:true});this.dashboardSlider=slider;var row=Dom.makeElement('div.dashboard-slider.dashboard-row.xs-hidden.sm-hidden',slider.render());Dom.queryFirst('.dashboard-outer').prepend(row);slider.addPoints(Array.range(1,this.layoutColumns));slider.getTargetPoints=function(val,idx){var span=2;var pts=this.getPoints(),vals=this.getValues(),chk={},ret=[],ok,i,j;for(i=0;i<pts.length;i++){chk[pts[i]]=0;}
for(i=0;i<vals.length;i++){if(i!==idx)chk[vals[i]]=1;}
for(i=0;i<pts.length;i++){ok=true;for(j=pts[i]-span+1;j<pts[i]+span;j++){if(get_default(chk[j],1)){ok=false;break;}}
if(ok)
ret.push(pts[i]);}
return ret;}
slider.onchange=function(){var ws=[],vals=this.getValues(),val,prev=0,tot=0,i,cols=Home.layoutColumns;for(i=0;i<vals.length;i++){val=Math.round(100*(vals[i]-prev)/cols);ws.push(val);tot+=val;prev=vals[i];}
if(ws.length){ws.push(Math.round(100-tot));Home.setColumnWidths(ws.join(','));}}
var pts=[],tot=0,val;for(var i=0;i<App.session.dashboard_widths.length-1;i++){val=App.session.dashboard_widths[i];tot+=val;pts.push(tot);}
slider.addValues(pts);slider.setup();}
this.makeDashletDraggable=function(id){var node=Dom.queryFirst('#dashlet-'+id).get(0);var header=Dom.queryFirst('#dashlet-header-'+id).get(0);if(node&&header)
new UI.Draggable(node,{sourceType:'HomeDasletEditor',handle:header,values:{id:id},onStart:function(evt){originalLayout=this.getLayout(true);draggingEl=evt.target;}.bind(this)});},this.initDragTarget=function(){this.drag_target=new UI.DragTarget(this.elt,{acceptedSourceTypes:['HomeDasletEditor'],drop_effect:'move',checkAccept:function(evt,data){if(data.values.id)return true;},onEnter:function(evt,data){requestAnimationFrame(function(){Dom.query('.dashlet-section').css('opacity',0.5);if(draggingEl)
draggingEl.style.opacity=1;});},onLeave:function(evt,data){Dom.query('.dashlet-section').css('opacity',null);},onDrop:function(evt){var newLayout=this.getLayout(true);if(originalLayout!=newLayout){this.saveLayout(newLayout);}}.bind(this),onMove:function(evt,data){var pos=data.position,parentNode,overDashlet;overDashlet=Wrap(evt.target).closest('.dashlet-section');if(overDashlet.length){overDashlet=overDashlet.get(0);parentNode=overDashlet.parentNode;var region=UI.getEltRegion(overDashlet);if(pos.y>region.top+(region.height/2))
overDashlet=overDashlet.nextSibling;}else{overDashlet=null;if(UI.hasClass(evt.target,'dashboard-column')&&!Wrap(evt.target).children('.dashlet-section').length)
parentNode=evt.target;}
if(parentNode){if(!overDashlet){parentNode.appendChild(draggingEl);}else if(overDashlet!=lastOverDashlet){parentNode.insertBefore(draggingEl,overDashlet);lastOverDashlet=overDashlet;}}}});for(var id in dashletWidth){this.makeDashletDraggable(id);}}});