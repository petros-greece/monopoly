import { Injectable  } from '@angular/core';
import { KeyValue } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import { MatDialog } from '@angular/material/dialog';
import { DialogService } from './../dialog/services/dialog.service';
import { DialogFactoryService } from './../dialog/services/dialog-factory.service';
import { DialogData } from './../dialog/models/dialog-data.model';
import { DialogOptions } from './../dialog/models/dialog-options.model'

@Injectable({
	providedIn: 'root'
})

export class HelpersService {
	
	constructor( 
    public toastr : ToastrService,
    private dialogService: DialogFactoryService,
    private matDialog : MatDialog, ){
	}

  /** GENERAL ******************************************************************************/
 
  pause(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  giveTonesRegEx(str:string){
    return str.
        replace(/α|ά/ig, '(α|ά)').
        replace(/ε|έ/ig, '(ε|έ)').
        replace(/η|ή/ig, '(η|ή)').
        replace(/ι|ί/ig, '(ι|ί)').
        replace(/ο|ό/ig, '(ο|ό)').
        replace(/υ|ύ/ig, '(υ|ύ)').
        replace(/ω|ώ/ig, '(ω|ώ)');
  } 

  objectKeys(obj:{}){
    return Object.keys(obj);
  }

  getValueType(value: any) : string{
    return Object.prototype.toString.call(value).replace(/\[object |\]/gi, '');
  }

  /**
   * getDeep(apiObj, ['level1', 'level2', 'target1']);
   */
  getDeep(obj:any, path:any) {
    let current = obj;
  
    for(let i = 0; i < path.length; ++i) {
      if (current[path[i]] == undefined) {
        return undefined;
      } else {
        current = current[path[i]];
      }
    }
    return current;
  }

  /**
   * setDeep(apiObj, ['level1', 'level2', 'target1'], 3);
   */
  setDeep(obj:any, path:any, value:any, setrecursively = true){

    let level = 0;

    path.reduce((a:any, b:any)=>{
      level++;

      if (setrecursively && typeof a[b] === "undefined" && level !== path.length){
        a[b] = {};
        return a[b];
      }

      if (level === path.length){
        a[b] = value;
        return value;
      } else {
        return a[b];
      }
    }, obj);
  }

  /** DIALOGS ****************************************************************************/

  openDialog(dialogData: DialogData, options?: DialogOptions): any {
    return this.dialogService.open(dialogData, options);
  }

  closeAllDialogs(): any {
    this.matDialog.closeAll();
  }  

  closeDialogById(id:string): any {
    //this.matDialog.getDialogById(id).close();
  } 

  /** VALIDATION *******************************************************/

  arrayUnique(array: any[]) : any[]{
    var a = array.concat();
    for(var i=0; i<a.length; ++i) {
      for(var j=i+1; j<a.length; ++j) {
        if(a[i] === a[j])
            a.splice(j--, 1);
      }
    }
    return a;
  }

  arrayOfObjsUnique(arr: any[], prop:string) : any[]{
    return arr.filter((value, index, self) => {
      return self.findIndex(v => v[prop] === value[prop]) === index;
    })
  }

  arrayAvg(arr: number[]) : number{
    let num = arr.reduce( ( p, c ) => p + c, 0 ) / arr.length;
    return Number(num.toFixed(2));
  }

  arrayIntersect(arr1: any[], arr2: any[]){
    return arr1.filter(value => arr2.includes(value));
  }

  arraySimilarity(arr1: any[], arr2: any[]) {
    let len = (arr1.length >= arr2.length ) ? arr1.length : arr2.length;
    let matchedPairs = 0;
    for (let i = 0; i < len; i+=1){
      if( (arr1[i] !== undefined) && (arr2[i] !== undefined) && (arr1[i] === arr2[i]) ){
        matchedPairs+=1;
      }
    }
    return matchedPairs;
  }

  arrayObjsSort(arr: any[], objProp:any){
    arr.sort((a,b) => (a[objProp] > b[objProp]) ? 1 : ((b[objProp] > a[objProp]) ? -1 : 0));
  }

  public rangeOfArray(size:any){
    const arr = [];
    for(let i=0; i<size; i+=1){
      arr.push(i);
    }

    return arr;
  };

  getNowTimeString(){
    const d = new Date();
    return d.toLocaleTimeString();
  }

  formatDate(date:any){
    return new Date(date).toLocaleString('el-GR', {/* dateStyle: 'medium',  timeStyle: 'short',*/ hour12: false });
  }

  showToastrError(msg: string, title: string = '', opts: any = {}){
    this.toastr.error(msg, title, opts);
  }

  showToastrSuccess(msg: string, title: string = '', opts: any = {}){
    this.toastr.success(msg, title, opts);
  }

  showToastrInfo(msg: string, title: string = '', opts: any = {}){
    this.toastr.info(msg, title, opts);
  }

  getSeason() {
    let month = new Date().getMonth();
    if (3 <= month && month <= 5) {
        return 'spring';
    }
    if (6 <= month && month <= 8) {
        return 'summer';
    }
    if (9 <= month && month <= 11) {
        return 'autumn';
    }
    return 'winter';
}

  /** LOCAL STORAGE ****************************************************/
 
  /**
   *  Return a js object or false in object does
   */
  getStorageObj(objName: string) : any{
    let item = localStorage.getItem(objName);
    return item ? 
          JSON.parse(item) : false;
  }

  getStorageObjDeep(objName: string, path: string[]) : any{
    let item = localStorage.getItem(objName);
    let obj = item ? 
          JSON.parse(item) : false;
    return obj ? this.getDeep(obj, path) : false;
  }

  /**
   *  Appends properties to existing object or creates a new local 
   *  storage json object. Overrides old ones  
   */
  updateStorageObj(objName: string, obj: any) : void {
    let item = localStorage.getItem(objName);
    let storageObj = item ? JSON.parse(item) : {}; Object.assign(storageObj, obj);
    localStorage.setItem(objName, JSON.stringify(storageObj));
  }

  /**
   *  Appends properties to existing object or creates 
   *  a new local storage json object  
   */
  updateStorageObjDeep(objName: string, path: any, value: any) : void {
    let item = localStorage.getItem(objName);
    let storageObj = item ? item : {};  
    this.setDeep(storageObj, path, value, true);
    localStorage.setItem(objName, JSON.stringify(storageObj));
  } 

 


  /** FILES ***************************************/

  dataURIToBlob(dataURI: string) : Blob{
    const splitDataURI = dataURI.split(',')
    const byteString = splitDataURI[0].indexOf('base64') >= 0 ? atob(splitDataURI[1]) : decodeURI(splitDataURI[1])
    const mimeString = splitDataURI[0].split(':')[1].split(';')[0]

    const ia = new Uint8Array(byteString.length)
    for (let i = 0; i < byteString.length; i++)
        ia[i] = byteString.charCodeAt(i)

    return new Blob([ia], { type: mimeString })
  }

  dataURIToBase64(dataURI: string) : string{
    return dataURI.replace(/^data:image\/(png|jpg|jpeg|gif);base64,/, '').
                  replace(/^data:video\/mp4;base64,/, '').
                  replace(/^data:application\/vnd.openxmlformats-officedocument.wordprocessingml.document;base64,/, '').
                  replace(/^data:application\/msword;base64,/, '').
                  replace(/^data:application\/vnd.openxmlformats-officedocument.presentationml.presentation;base64/, '').
                  replace(/^data:application\/vnd.ms-powerpoint;base64,/, '').
                  replace(/^data:application\/vnd.ms-powerpoint;base64,/, '').
                  replace(/^data:application\/pdf;base64,/, '').
                  replace(/^data:text\/plain;base64,/, '').
                  replace(/^data:application\/xml;base64,/, '').
                  replace(/^data:application\/json;base64,/, '').
                  replace(/^data:video\/x-msvideo;base64,/, '').
                  replace(/^data:application\/octet-stream;base64,/, '');    
  }

  /** PIPES LIKE *******************************/
 
  //{{hasOwnProp('product', 'sku') ? '' : 'no k'}}
  //*ngIf="hasOwnProp('product', 'sku')"
  hasOwnProp(obj:any, prop:string) : boolean{
    return obj.hasOwnProperty(prop);
  }

  
//*ngIf="propLen('product') > 4"
  propsLen(obj:any) : number{
    return Object.keys(obj).length;
  }

  mathRound(num:number) : number{
    return Math.round(num);
  }

  clone(obj:any) : any{
    return JSON.parse(JSON.stringify(obj));
  }

  isUrlType(str:string){
    const pattern = new RegExp('^(https?:\\/\\/)?'+ // protocol
    '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+ // domain name
    '((\\d{1,3}\\.){3}\\d{1,3}))'+ // OR ip (v4) address
    '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'); // port and path

    // IF VALID RETURN TRUE
    return !!pattern.test(str);
  };

  extractHostname(url:string) : string{
    let hostname: string;
    //find & remove protocol (http, ftp, etc.) and get hostname

    if (url.indexOf("//") > -1) {
      hostname = url.split('/')[2];
    }
    else {
      hostname = url.split('/')[0];
    }

    //find & remove port number
    hostname = hostname.split(':')[0];
    //find & remove "?"
    hostname = hostname.split('?')[0];

    return hostname;
  }

  /** EXTRA *******************************/

  originalOrder = (a: KeyValue<number,string>, b: KeyValue<number,string>): number => {
    return 0;
  }



}






