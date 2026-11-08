import{o as Sp,_ as be,R as ma}from"./vendor-D_Zhxc9l.js";const Cp=()=>{};var Nu={};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const rh=function(n){const e=[];let t=0;for(let r=0;r<n.length;r++){let s=n.charCodeAt(r);s<128?e[t++]=s:s<2048?(e[t++]=s>>6|192,e[t++]=s&63|128):(s&64512)===55296&&r+1<n.length&&(n.charCodeAt(r+1)&64512)===56320?(s=65536+((s&1023)<<10)+(n.charCodeAt(++r)&1023),e[t++]=s>>18|240,e[t++]=s>>12&63|128,e[t++]=s>>6&63|128,e[t++]=s&63|128):(e[t++]=s>>12|224,e[t++]=s>>6&63|128,e[t++]=s&63|128)}return e},xp=function(n){const e=[];let t=0,r=0;for(;t<n.length;){const s=n[t++];if(s<128)e[r++]=String.fromCharCode(s);else if(s>191&&s<224){const i=n[t++];e[r++]=String.fromCharCode((s&31)<<6|i&63)}else if(s>239&&s<365){const i=n[t++],a=n[t++],c=n[t++],l=((s&7)<<18|(i&63)<<12|(a&63)<<6|c&63)-65536;e[r++]=String.fromCharCode(55296+(l>>10)),e[r++]=String.fromCharCode(56320+(l&1023))}else{const i=n[t++],a=n[t++];e[r++]=String.fromCharCode((s&15)<<12|(i&63)<<6|a&63)}}return e.join("")},sh={byteToCharMap_:null,charToByteMap_:null,byteToCharMapWebSafe_:null,charToByteMapWebSafe_:null,ENCODED_VALS_BASE:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",get ENCODED_VALS(){return this.ENCODED_VALS_BASE+"+/="},get ENCODED_VALS_WEBSAFE(){return this.ENCODED_VALS_BASE+"-_."},HAS_NATIVE_SUPPORT:typeof atob=="function",encodeByteArray(n,e){if(!Array.isArray(n))throw Error("encodeByteArray takes an array as a parameter");this.init_();const t=e?this.byteToCharMapWebSafe_:this.byteToCharMap_,r=[];for(let s=0;s<n.length;s+=3){const i=n[s],a=s+1<n.length,c=a?n[s+1]:0,l=s+2<n.length,f=l?n[s+2]:0,d=i>>2,m=(i&3)<<4|c>>4;let I=(c&15)<<2|f>>6,V=f&63;l||(V=64,a||(I=64)),r.push(t[d],t[m],t[I],t[V])}return r.join("")},encodeString(n,e){return this.HAS_NATIVE_SUPPORT&&!e?btoa(n):this.encodeByteArray(rh(n),e)},decodeString(n,e){return this.HAS_NATIVE_SUPPORT&&!e?atob(n):xp(this.decodeStringToByteArray(n,e))},decodeStringToByteArray(n,e){this.init_();const t=e?this.charToByteMapWebSafe_:this.charToByteMap_,r=[];for(let s=0;s<n.length;){const i=t[n.charAt(s++)],c=s<n.length?t[n.charAt(s)]:0;++s;const f=s<n.length?t[n.charAt(s)]:64;++s;const m=s<n.length?t[n.charAt(s)]:64;if(++s,i==null||c==null||f==null||m==null)throw new Np;const I=i<<2|c>>4;if(r.push(I),f!==64){const V=c<<4&240|f>>2;if(r.push(V),m!==64){const x=f<<6&192|m;r.push(x)}}}return r},init_(){if(!this.byteToCharMap_){this.byteToCharMap_={},this.charToByteMap_={},this.byteToCharMapWebSafe_={},this.charToByteMapWebSafe_={};for(let n=0;n<this.ENCODED_VALS.length;n++)this.byteToCharMap_[n]=this.ENCODED_VALS.charAt(n),this.charToByteMap_[this.byteToCharMap_[n]]=n,this.byteToCharMapWebSafe_[n]=this.ENCODED_VALS_WEBSAFE.charAt(n),this.charToByteMapWebSafe_[this.byteToCharMapWebSafe_[n]]=n,n>=this.ENCODED_VALS_BASE.length&&(this.charToByteMap_[this.ENCODED_VALS_WEBSAFE.charAt(n)]=n,this.charToByteMapWebSafe_[this.ENCODED_VALS.charAt(n)]=n)}}};class Np extends Error{constructor(){super(...arguments),this.name="DecodeBase64StringError"}}const kp=function(n){const e=rh(n);return sh.encodeByteArray(e,!0)},mi=function(n){return kp(n).replace(/\./g,"")},ih=function(n){try{return sh.decodeString(n,!0)}catch(e){console.error("base64Decode failed: ",e)}return null};/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Dp(){if(typeof self<"u")return self;if(typeof window<"u")return window;if(typeof global<"u")return global;throw new Error("Unable to locate global object.")}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Op=()=>Dp().__FIREBASE_DEFAULTS__,Lp=()=>{if(typeof process>"u"||typeof Nu>"u")return;const n=Nu.__FIREBASE_DEFAULTS__;if(n)return JSON.parse(n)},Mp=()=>{if(typeof document>"u")return;let n;try{n=document.cookie.match(/__FIREBASE_DEFAULTS__=([^;]+)/)}catch{return}const e=n&&ih(n[1]);return e&&JSON.parse(e)},Fi=()=>{try{return Cp()||Op()||Lp()||Mp()}catch(n){console.info(`Unable to get __FIREBASE_DEFAULTS__ due to: ${n}`);return}},oh=n=>{var e,t;return(t=(e=Fi())==null?void 0:e.emulatorHosts)==null?void 0:t[n]},Up=n=>{const e=oh(n);if(!e)return;const t=e.lastIndexOf(":");if(t<=0||t+1===e.length)throw new Error(`Invalid host ${e} with no separate hostname and port!`);const r=parseInt(e.substring(t+1),10);return e[0]==="["?[e.substring(1,t-1),r]:[e.substring(0,t),r]},ah=()=>{var n;return(n=Fi())==null?void 0:n.config},ch=n=>{var e;return(e=Fi())==null?void 0:e[`_${n}`]};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Fp{constructor(){this.reject=()=>{},this.resolve=()=>{},this.promise=new Promise((e,t)=>{this.resolve=e,this.reject=t})}wrapCallback(e){return(t,r)=>{t?this.reject(t):this.resolve(r),typeof e=="function"&&(this.promise.catch(()=>{}),e.length===1?e(t):e(t,r))}}}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Bp(n,e){if(n.uid)throw new Error('The "uid" field is no longer supported by mockUserToken. Please use "sub" instead for Firebase Auth User ID.');const t={alg:"none",type:"JWT"},r=e||"demo-project",s=n.iat||0,i=n.sub||n.user_id;if(!i)throw new Error("mockUserToken must contain 'sub' or 'user_id' field!");const a={iss:`https://securetoken.google.com/${r}`,aud:r,iat:s,exp:s+3600,auth_time:s,sub:i,user_id:i,firebase:{sign_in_provider:"custom",identities:{}},...n};return[mi(JSON.stringify(t)),mi(JSON.stringify(a)),""].join(".")}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Ne(){return typeof navigator<"u"&&typeof navigator.userAgent=="string"?navigator.userAgent:""}function qp(){return typeof window<"u"&&!!(window.cordova||window.phonegap||window.PhoneGap)&&/ios|iphone|ipod|ipad|android|blackberry|iemobile/i.test(Ne())}function $p(){var e;const n=(e=Fi())==null?void 0:e.forceEnvironment;if(n==="node")return!0;if(n==="browser")return!1;try{return Object.prototype.toString.call(global.process)==="[object process]"}catch{return!1}}function jp(){return typeof navigator<"u"&&navigator.userAgent==="Cloudflare-Workers"}function zp(){const n=typeof chrome=="object"?chrome.runtime:typeof browser=="object"?browser.runtime:void 0;return typeof n=="object"&&n.id!==void 0}function Gp(){return typeof navigator=="object"&&navigator.product==="ReactNative"}function Wp(){const n=Ne();return n.indexOf("MSIE ")>=0||n.indexOf("Trident/")>=0}function Hp(){return!$p()&&!!navigator.userAgent&&navigator.userAgent.includes("Safari")&&!navigator.userAgent.includes("Chrome")}function Kp(){try{return typeof indexedDB=="object"}catch{return!1}}function Qp(){return new Promise((n,e)=>{try{let t=!0;const r="validate-browser-context-for-indexeddb-analytics-module",s=self.indexedDB.open(r);s.onsuccess=()=>{s.result.close(),t||self.indexedDB.deleteDatabase(r),n(!0)},s.onupgradeneeded=()=>{t=!1},s.onerror=()=>{var i;e(((i=s.error)==null?void 0:i.message)||"")}}catch(t){e(t)}})}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Yp="FirebaseError";class kt extends Error{constructor(e,t,r){super(t),this.code=e,this.customData=r,this.name=Yp,Object.setPrototypeOf(this,kt.prototype),Error.captureStackTrace&&Error.captureStackTrace(this,ys.prototype.create)}}class ys{constructor(e,t,r){this.service=e,this.serviceName=t,this.errors=r}create(e,...t){const r=t[0]||{},s=`${this.service}/${e}`,i=this.errors[e],a=i?Jp(i,r):"Error",c=`${this.serviceName}: ${a} (${s}).`;return new kt(s,c,r)}}function Jp(n,e){try{let t=0,r="";for(;t<n.length;){const s=n.indexOf("{$",t);if(s===-1){r+=n.substring(t);break}const i=n.indexOf("}",s+2);if(i===-1){r+=n.substring(t);break}const a=n.substring(s+2,i),c=e[a];r+=n.substring(t,s)+(c!=null?String(c):`<${a}?>`),t=i+1}return r}catch{return n}}function Xp(n){for(const e in n)if(Object.prototype.hasOwnProperty.call(n,e))return!1;return!0}function bn(n,e){if(n===e)return!0;const t=Object.keys(n),r=Object.keys(e);for(const s of t){if(!r.includes(s))return!1;const i=n[s],a=e[s];if(ku(i)&&ku(a)){if(!bn(i,a))return!1}else if(i!==a)return!1}for(const s of r)if(!t.includes(s))return!1;return!0}function ku(n){return n!==null&&typeof n=="object"}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Es(n){const e=[];for(const[t,r]of Object.entries(n))Array.isArray(r)?r.forEach(s=>{e.push(encodeURIComponent(t)+"="+encodeURIComponent(s))}):e.push(encodeURIComponent(t)+"="+encodeURIComponent(r));return e.length?"&"+e.join("&"):""}function Zp(n,e){const t=new em(n,e);return t.subscribe.bind(t)}class em{constructor(e,t){this.observers=[],this.unsubscribes=[],this.observerCount=0,this.task=Promise.resolve(),this.finalized=!1,this.onNoObservers=t,this.task.then(()=>{e(this)}).catch(r=>{this.error(r)})}next(e){this.forEachObserver(t=>{t.next(e)})}error(e){this.forEachObserver(t=>{t.error(e)}),this.close(e)}complete(){this.forEachObserver(e=>{e.complete()}),this.close()}subscribe(e,t,r){let s;if(e===void 0&&t===void 0&&r===void 0)throw new Error("Missing Observer.");tm(e,["next","error","complete"])?s=e:s={next:e,error:t,complete:r},s.next===void 0&&(s.next=ko),s.error===void 0&&(s.error=ko),s.complete===void 0&&(s.complete=ko);const i=this.unsubscribeOne.bind(this,this.observers.length);return this.finalized&&this.task.then(()=>{try{this.finalError?s.error(this.finalError):s.complete()}catch{}}),this.observers.push(s),i}unsubscribeOne(e){this.observers===void 0||this.observers[e]===void 0||(delete this.observers[e],this.observerCount-=1,this.observerCount===0&&this.onNoObservers!==void 0&&this.onNoObservers(this))}forEachObserver(e){if(!this.finalized)for(let t=0;t<this.observers.length;t++)this.sendOne(t,e)}sendOne(e,t){this.task.then(()=>{if(this.observers!==void 0&&this.observers[e]!==void 0)try{t(this.observers[e])}catch(r){typeof console<"u"&&console.error&&console.error(r)}})}close(e){this.finalized||(this.finalized=!0,e!==void 0&&(this.finalError=e),this.task.then(()=>{this.observers=void 0,this.onNoObservers=void 0}))}}function tm(n,e){if(typeof n!="object"||n===null)return!1;for(const t of e)if(t in n&&typeof n[t]=="function")return!0;return!1}function ko(){}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function $e(n){return n&&n._delegate?n._delegate:n}/**
 * @license
 * Copyright 2025 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function ws(n){try{return(n.startsWith("http://")||n.startsWith("https://")?new URL(n).hostname:n).endsWith(".cloudworkstations.dev")}catch{return!1}}async function uh(n){return(await fetch(n,{credentials:"include"})).ok}class Rn{constructor(e,t,r){this.name=e,this.instanceFactory=t,this.type=r,this.multipleInstances=!1,this.serviceProps={},this.instantiationMode="LAZY",this.onInstanceCreated=null}setInstantiationMode(e){return this.instantiationMode=e,this}setMultipleInstances(e){return this.multipleInstances=e,this}setServiceProps(e){return this.serviceProps=e,this}setInstanceCreatedCallback(e){return this.onInstanceCreated=e,this}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const gn="[DEFAULT]";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class nm{constructor(e,t){this.name=e,this.container=t,this.component=null,this.instances=new Map,this.instancesDeferred=new Map,this.instancesOptions=new Map,this.onInitCallbacks=new Map}get(e){const t=this.normalizeInstanceIdentifier(e);if(!this.instancesDeferred.has(t)){const r=new Fp;if(this.instancesDeferred.set(t,r),this.isInitialized(t)||this.shouldAutoInitialize())try{const s=this.getOrInitializeService({instanceIdentifier:t});s&&r.resolve(s)}catch{}}return this.instancesDeferred.get(t).promise}getImmediate(e){const t=this.normalizeInstanceIdentifier(e==null?void 0:e.identifier),r=(e==null?void 0:e.optional)??!1;if(this.isInitialized(t)||this.shouldAutoInitialize())try{return this.getOrInitializeService({instanceIdentifier:t})}catch(s){if(r)return null;throw s}else{if(r)return null;throw Error(`Service ${this.name} is not available`)}}getComponent(){return this.component}setComponent(e){if(e.name!==this.name)throw Error(`Mismatching Component ${e.name} for Provider ${this.name}.`);if(this.component)throw Error(`Component for ${this.name} has already been provided`);if(this.component=e,!!this.shouldAutoInitialize()){if(sm(e))try{this.getOrInitializeService({instanceIdentifier:gn})}catch{}for(const[t,r]of this.instancesDeferred.entries()){const s=this.normalizeInstanceIdentifier(t);try{const i=this.getOrInitializeService({instanceIdentifier:s});r.resolve(i)}catch{}}}}clearInstance(e=gn){this.instancesDeferred.delete(e),this.instancesOptions.delete(e),this.instances.delete(e)}async delete(){const e=Array.from(this.instances.values());await Promise.all([...e.filter(t=>"INTERNAL"in t).map(t=>t.INTERNAL.delete()),...e.filter(t=>"_delete"in t).map(t=>t._delete())])}isComponentSet(){return this.component!=null}isInitialized(e=gn){return this.instances.has(e)}getOptions(e=gn){return this.instancesOptions.get(e)||{}}initialize(e={}){const{options:t={}}=e,r=this.normalizeInstanceIdentifier(e.instanceIdentifier);if(this.isInitialized(r))throw Error(`${this.name}(${r}) has already been initialized`);if(!this.isComponentSet())throw Error(`Component ${this.name} has not been registered yet`);const s=this.getOrInitializeService({instanceIdentifier:r,options:t});for(const[i,a]of this.instancesDeferred.entries()){const c=this.normalizeInstanceIdentifier(i);r===c&&a.resolve(s)}return s}onInit(e,t){const r=this.normalizeInstanceIdentifier(t),s=this.onInitCallbacks.get(r)??new Set;s.add(e),this.onInitCallbacks.set(r,s);const i=this.instances.get(r);return i&&e(i,r),()=>{s.delete(e)}}invokeOnInitCallbacks(e,t){const r=this.onInitCallbacks.get(t);if(r)for(const s of r)try{s(e,t)}catch{}}getOrInitializeService({instanceIdentifier:e,options:t={}}){let r=this.instances.get(e);if(!r&&this.component&&(r=this.component.instanceFactory(this.container,{instanceIdentifier:rm(e),options:t}),this.instances.set(e,r),this.instancesOptions.set(e,t),this.invokeOnInitCallbacks(r,e),this.component.onInstanceCreated))try{this.component.onInstanceCreated(this.container,e,r)}catch{}return r||null}normalizeInstanceIdentifier(e=gn){return this.component?this.component.multipleInstances?e:gn:e}shouldAutoInitialize(){return!!this.component&&this.component.instantiationMode!=="EXPLICIT"}}function rm(n){return n===gn?void 0:n}function sm(n){return n.instantiationMode==="EAGER"}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class im{constructor(e){this.name=e,this.providers=new Map}addComponent(e){const t=this.getProvider(e.name);if(t.isComponentSet())throw new Error(`Component ${e.name} has already been registered with ${this.name}`);t.setComponent(e)}addOrOverwriteComponent(e){this.getProvider(e.name).isComponentSet()&&this.providers.delete(e.name),this.addComponent(e)}getProvider(e){if(this.providers.has(e))return this.providers.get(e);const t=new nm(e,this);return this.providers.set(e,t),t}getProviders(){return Array.from(this.providers.values())}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */var X;(function(n){n[n.DEBUG=0]="DEBUG",n[n.VERBOSE=1]="VERBOSE",n[n.INFO=2]="INFO",n[n.WARN=3]="WARN",n[n.ERROR=4]="ERROR",n[n.SILENT=5]="SILENT"})(X||(X={}));const om={debug:X.DEBUG,verbose:X.VERBOSE,info:X.INFO,warn:X.WARN,error:X.ERROR,silent:X.SILENT},am=X.INFO,cm={[X.DEBUG]:"log",[X.VERBOSE]:"log",[X.INFO]:"info",[X.WARN]:"warn",[X.ERROR]:"error"},um=(n,e,...t)=>{if(e<n.logLevel)return;const r=new Date().toISOString(),s=cm[e];if(s)console[s](`[${r}]  ${n.name}:`,...t);else throw new Error(`Attempted to log a message with an invalid logType (value: ${e})`)};class ga{constructor(e){this.name=e,this._logLevel=am,this._logHandler=um,this._userLogHandler=null}get logLevel(){return this._logLevel}set logLevel(e){if(!(e in X))throw new TypeError(`Invalid value "${e}" assigned to \`logLevel\``);this._logLevel=e}setLogLevel(e){this._logLevel=typeof e=="string"?om[e]:e}get logHandler(){return this._logHandler}set logHandler(e){if(typeof e!="function")throw new TypeError("Value assigned to `logHandler` must be a function");this._logHandler=e}get userLogHandler(){return this._userLogHandler}set userLogHandler(e){this._userLogHandler=e}debug(...e){this._userLogHandler&&this._userLogHandler(this,X.DEBUG,...e),this._logHandler(this,X.DEBUG,...e)}log(...e){this._userLogHandler&&this._userLogHandler(this,X.VERBOSE,...e),this._logHandler(this,X.VERBOSE,...e)}info(...e){this._userLogHandler&&this._userLogHandler(this,X.INFO,...e),this._logHandler(this,X.INFO,...e)}warn(...e){this._userLogHandler&&this._userLogHandler(this,X.WARN,...e),this._logHandler(this,X.WARN,...e)}error(...e){this._userLogHandler&&this._userLogHandler(this,X.ERROR,...e),this._logHandler(this,X.ERROR,...e)}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class lm{constructor(e){this.container=e}getPlatformInfoString(){return this.container.getProviders().map(t=>{if(hm(t)){const r=t.getImmediate();return`${r.library}/${r.version}`}else return null}).filter(t=>t).join(" ")}}function hm(n){const e=n.getComponent();return(e==null?void 0:e.type)==="VERSION"}const zo="@firebase/app",Du="0.16.4";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Vt=new ga("@firebase/app"),fm="@firebase/app-compat",dm="@firebase/analytics-compat",pm="@firebase/analytics",mm="@firebase/app-check-compat",gm="@firebase/app-check",_m="@firebase/auth",ym="@firebase/auth-compat",Em="@firebase/database",wm="@firebase/data-connect",Tm="@firebase/database-compat",Im="@firebase/functions",vm="@firebase/functions-compat",Am="@firebase/installations",bm="@firebase/installations-compat",Rm="@firebase/messaging",Pm="@firebase/messaging-compat",Vm="@firebase/performance",Sm="@firebase/performance-compat",Cm="@firebase/remote-config",xm="@firebase/remote-config-compat",Nm="@firebase/storage",km="@firebase/storage-compat",Dm="@firebase/firestore",Om="@firebase/ai",Lm="@firebase/firestore-compat",Mm="firebase",Um="13.1.0";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Go="[DEFAULT]",Fm={[zo]:"fire-core",[fm]:"fire-core-compat",[pm]:"fire-analytics",[dm]:"fire-analytics-compat",[gm]:"fire-app-check",[mm]:"fire-app-check-compat",[_m]:"fire-auth",[ym]:"fire-auth-compat",[Em]:"fire-rtdb",[wm]:"fire-data-connect",[Tm]:"fire-rtdb-compat",[Im]:"fire-fn",[vm]:"fire-fn-compat",[Am]:"fire-iid",[bm]:"fire-iid-compat",[Rm]:"fire-fcm",[Pm]:"fire-fcm-compat",[Vm]:"fire-perf",[Sm]:"fire-perf-compat",[Cm]:"fire-rc",[xm]:"fire-rc-compat",[Nm]:"fire-gcs",[km]:"fire-gcs-compat",[Dm]:"fire-fst",[Lm]:"fire-fst-compat",[Om]:"fire-vertex","fire-js":"fire-js",[Mm]:"fire-js-all"};/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const gi=new Map,Bm=new Map,Wo=new Map;function Ou(n,e){try{n.container.addComponent(e)}catch(t){Vt.debug(`Component ${e.name} failed to register with FirebaseApp ${n.name}`,t)}}function Jn(n){const e=n.name;if(Wo.has(e))return Vt.debug(`There were multiple attempts to register component ${e}.`),!1;Wo.set(e,n);for(const t of gi.values())Ou(t,n);for(const t of Bm.values())Ou(t,n);return!0}function _a(n,e){const t=n.container.getProvider("heartbeat").getImmediate({optional:!0});return t&&t.triggerHeartbeat(),n.container.getProvider(e)}function tt(n){return n==null?!1:n.settings!==void 0}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const qm={"no-app":"No Firebase App '{$appName}' has been created - call initializeApp() first","bad-app-name":"Illegal App name: '{$appName}'","duplicate-app":"Firebase App named '{$appName}' already exists with different {$mismatchedParam}. Existing: '{$oldValue}'. New: '{$newValue}'.","app-deleted":"Firebase App named '{$appName}' already deleted","server-app-deleted":"Firebase Server App has been deleted","no-options":"Need to provide options, when not being deployed to hosting via source.","invalid-app-argument":"firebase.{$appName}() takes either no argument or a Firebase App instance.","invalid-log-argument":"First argument to `onLog` must be null or a function.","idb-open":"Error thrown when opening IndexedDB. Original error: {$originalErrorMessage}.","idb-get":"Error thrown when reading from IndexedDB. Original error: {$originalErrorMessage}.","idb-set":"Error thrown when writing to IndexedDB. Original error: {$originalErrorMessage}.","idb-delete":"Error thrown when deleting from IndexedDB. Original error: {$originalErrorMessage}.","finalization-registry-not-supported":"FirebaseServerApp deleteOnDeref field defined but the JS runtime does not support FinalizationRegistry.","invalid-server-app-environment":"FirebaseServerApp is not for use in browser environments."},wt=new ys("app","Firebase",qm);/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class $m{constructor(e,t,r){this._isDeleted=!1,this._options={...e},this._config={...t},this._name=t.name,this._automaticDataCollectionEnabled=t.automaticDataCollectionEnabled,this._container=r,this.container.addComponent(new Rn("app",()=>this,"PUBLIC"))}get automaticDataCollectionEnabled(){return this.checkDestroyed(),this._automaticDataCollectionEnabled}set automaticDataCollectionEnabled(e){this.checkDestroyed(),this._automaticDataCollectionEnabled=e}get name(){return this.checkDestroyed(),this._name}get options(){return this.checkDestroyed(),this._options}get config(){return this.checkDestroyed(),this._config}get container(){return this._container}get isDeleted(){return this._isDeleted}set isDeleted(e){this._isDeleted=e}checkDestroyed(){if(this.isDeleted)throw wt.create("app-deleted",{appName:this._name})}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const cr=Um;function jm(n,e={}){let t=n;typeof e!="object"&&(e={name:e});const r={name:Go,automaticDataCollectionEnabled:!0,...e},s=r.name;if(typeof s!="string"||!s)throw wt.create("bad-app-name",{appName:String(s)});if(t||(t=ah()),!t)throw wt.create("no-options");const i=gi.get(s);if(i)if(bn(t,i.options)){if(bn(r,i.config))return i;throw wt.create("duplicate-app",{appName:s,mismatchedParam:"config",oldValue:JSON.stringify(i.config),newValue:JSON.stringify(r)})}else throw wt.create("duplicate-app",{appName:s,mismatchedParam:"options",oldValue:JSON.stringify(i.options),newValue:JSON.stringify(t)});const a=new im(s);for(const l of Wo.values())a.addComponent(l);const c=new $m(t,r,a);return gi.set(s,c),c}function lh(n=Go){const e=gi.get(n);if(!e&&n===Go&&ah())return jm();if(!e)throw wt.create("no-app",{appName:n});return e}function Ht(n,e,t){let r=Fm[n]??n;t&&(r+=`-${t}`);const s=r.match(/\s|\//),i=e.match(/\s|\//);if(s||i){const a=[`Unable to register library "${r}" with version "${e}":`];s&&a.push(`library name "${r}" contains illegal characters (whitespace or "/")`),s&&i&&a.push("and"),i&&a.push(`version name "${e}" contains illegal characters (whitespace or "/")`),Vt.warn(a.join(" "));return}Jn(new Rn(`${r}-version`,()=>({library:r,version:e}),"VERSION"))}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const zm="firebase-heartbeat-database",Gm=1,Qr="firebase-heartbeat-store";let Do=null;function hh(){return Do||(Do=Sp(zm,Gm,{upgrade:(n,e)=>{switch(e){case 0:try{n.createObjectStore(Qr)}catch(t){console.warn(t)}}}}).catch(n=>{throw wt.create("idb-open",{originalErrorMessage:n.message})})),Do}async function Wm(n){try{const t=(await hh()).transaction(Qr),r=await t.objectStore(Qr).get(fh(n));return await t.done,r}catch(e){if(e instanceof kt)Vt.warn(e.message);else{const t=wt.create("idb-get",{originalErrorMessage:e==null?void 0:e.message});Vt.warn(t.message)}}}async function Lu(n,e){try{const r=(await hh()).transaction(Qr,"readwrite");await r.objectStore(Qr).put(e,fh(n)),await r.done}catch(t){if(t instanceof kt)Vt.warn(t.message);else{const r=wt.create("idb-set",{originalErrorMessage:t==null?void 0:t.message});Vt.warn(r.message)}}}function fh(n){return`${n.name}!${n.options.appId}`}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Hm=1024,Km=30;class Qm{constructor(e){this.container=e,this._heartbeatsCache=null;const t=this.container.getProvider("app").getImmediate();this._storage=new Jm(t),this._heartbeatsCachePromise=this._storage.read().then(r=>(this._heartbeatsCache=r,r))}async triggerHeartbeat(){var e,t;try{const s=this.container.getProvider("platform-logger").getImmediate().getPlatformInfoString(),i=Mu();if(((e=this._heartbeatsCache)==null?void 0:e.heartbeats)==null&&(this._heartbeatsCache=await this._heartbeatsCachePromise,((t=this._heartbeatsCache)==null?void 0:t.heartbeats)==null)||this._heartbeatsCache.lastSentHeartbeatDate===i||this._heartbeatsCache.heartbeats.some(a=>a.date===i))return;if(this._heartbeatsCache.heartbeats.push({date:i,agent:s}),this._heartbeatsCache.heartbeats.length>Km){const a=Xm(this._heartbeatsCache.heartbeats);this._heartbeatsCache.heartbeats.splice(a,1)}return this._storage.overwrite(this._heartbeatsCache)}catch(r){Vt.warn(r)}}async getHeartbeatsHeader(){var e;try{if(this._heartbeatsCache===null&&await this._heartbeatsCachePromise,((e=this._heartbeatsCache)==null?void 0:e.heartbeats)==null||this._heartbeatsCache.heartbeats.length===0)return"";const t=Mu(),{heartbeatsToSend:r,unsentEntries:s}=Ym(this._heartbeatsCache.heartbeats),i=mi(JSON.stringify({version:2,heartbeats:r}));return this._heartbeatsCache.lastSentHeartbeatDate=t,s.length>0?(this._heartbeatsCache.heartbeats=s,await this._storage.overwrite(this._heartbeatsCache)):(this._heartbeatsCache.heartbeats=[],this._storage.overwrite(this._heartbeatsCache)),i}catch(t){return Vt.warn(t),""}}}function Mu(){return new Date().toISOString().substring(0,10)}function Ym(n,e=Hm){const t=[];let r=n.slice();for(const s of n){const i=t.find(a=>a.agent===s.agent);if(i){if(i.dates.push(s.date),Uu(t)>e){i.dates.pop();break}}else if(t.push({agent:s.agent,dates:[s.date]}),Uu(t)>e){t.pop();break}r=r.slice(1)}return{heartbeatsToSend:t,unsentEntries:r}}class Jm{constructor(e){this.app=e,this._canUseIndexedDBPromise=this.runIndexedDBEnvironmentCheck()}async runIndexedDBEnvironmentCheck(){return Kp()?Qp().then(()=>!0).catch(()=>!1):!1}async read(){if(await this._canUseIndexedDBPromise){const t=await Wm(this.app);return t!=null&&t.heartbeats?t:{heartbeats:[]}}else return{heartbeats:[]}}async overwrite(e){if(await this._canUseIndexedDBPromise){const r=await this.read();return Lu(this.app,{lastSentHeartbeatDate:e.lastSentHeartbeatDate??r.lastSentHeartbeatDate,heartbeats:e.heartbeats})}else return}async add(e){if(await this._canUseIndexedDBPromise){const r=await this.read();return Lu(this.app,{lastSentHeartbeatDate:e.lastSentHeartbeatDate??r.lastSentHeartbeatDate,heartbeats:[...r.heartbeats,...e.heartbeats]})}else return}}function Uu(n){return mi(JSON.stringify({version:2,heartbeats:n})).length}function Xm(n){if(n.length===0)return-1;let e=0,t=n[0].date;for(let r=1;r<n.length;r++)n[r].date<t&&(t=n[r].date,e=r);return e}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Zm(n){Jn(new Rn("platform-logger",e=>new lm(e),"PRIVATE")),Jn(new Rn("heartbeat",e=>new Qm(e),"PRIVATE")),Ht(zo,Du,n),Ht(zo,Du,"esm2020"),Ht("fire-js","")}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */Zm("");var eg="firebase",tg="13.1.0";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */Ht(eg,tg,"app");function dh(){return{"dependent-sdk-initialized-before-auth":"Another Firebase SDK was initialized and is trying to use Auth before Auth is initialized. Please be sure to call `initializeAuth` or `getAuth` before starting any other Firebase SDK."}}const ng=dh,ph=new ys("auth","Firebase",dh());/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const _i=new ga("@firebase/auth");function ri(n,...e){_i.logLevel<=X.WARN&&_i.warn(`Auth (${cr}): ${n}`,...e)}function si(n,...e){_i.logLevel<=X.ERROR&&_i.error(`Auth (${cr}): ${n}`,...e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function _t(n,...e){throw ya(n,...e)}function st(n,...e){return ya(n,...e)}function Bi(n,e,t){const r={...ng(),[e]:t};return new ys("auth","Firebase",r).create(e,{appName:n.name})}function wn(n){return Bi(n,"operation-not-supported-in-this-environment","Operations that alter the current user are not supported in conjunction with FirebaseServerApp")}function rg(n,e,t){const r=t;if(!(e instanceof r))throw r.name!==e.constructor.name&&_t(n,"argument-error"),Bi(n,"argument-error",`Type of ${e.constructor.name} does not match expected instance.Did you pass a reference from a different Auth SDK?`)}function ya(n,...e){if(typeof n!="string"){const t=e[0],r=[...e.slice(1)];return r[0]&&(r[0].appName=n.name),n._errorFactory.create(t,...r)}return ph.create(n,...e)}function z(n,e,...t){if(!n)throw ya(e,...t)}function Tt(n){const e="INTERNAL ASSERTION FAILED: "+n;throw si(e),new Error(e)}function St(n,e){n||Tt(e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Ho(){var n;return typeof self<"u"&&((n=self.location)==null?void 0:n.href)||""}function sg(){return Fu()==="http:"||Fu()==="https:"}function Fu(){var n;return typeof self<"u"&&((n=self.location)==null?void 0:n.protocol)||null}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function ig(){return typeof navigator<"u"&&navigator&&"onLine"in navigator&&typeof navigator.onLine=="boolean"&&(sg()||zp()||"connection"in navigator)?navigator.onLine:!0}function og(){if(typeof navigator>"u")return null;const n=navigator;return n.languages&&n.languages[0]||n.language||null}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ts{constructor(e,t){this.shortDelay=e,this.longDelay=t,St(t>e,"Short delay should be less than long delay!"),this.isMobile=qp()||Gp()}get(){return ig()?this.isMobile?this.longDelay:this.shortDelay:Math.min(5e3,this.shortDelay)}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Ea(n,e){St(n.emulator,"Emulator should always be set here");const{url:t}=n.emulator;return e?`${t}${e.startsWith("/")?e.slice(1):e}`:t}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class mh{static initialize(e,t,r){this.fetchImpl=e,t&&(this.headersImpl=t),r&&(this.responseImpl=r)}static fetch(){if(this.fetchImpl)return this.fetchImpl;if(typeof self<"u"&&"fetch"in self)return self.fetch;if(typeof globalThis<"u"&&globalThis.fetch)return globalThis.fetch;if(typeof fetch<"u")return fetch;Tt("Could not find fetch implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill")}static headers(){if(this.headersImpl)return this.headersImpl;if(typeof self<"u"&&"Headers"in self)return self.Headers;if(typeof globalThis<"u"&&globalThis.Headers)return globalThis.Headers;if(typeof Headers<"u")return Headers;Tt("Could not find Headers implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill")}static response(){if(this.responseImpl)return this.responseImpl;if(typeof self<"u"&&"Response"in self)return self.Response;if(typeof globalThis<"u"&&globalThis.Response)return globalThis.Response;if(typeof Response<"u")return Response;Tt("Could not find Response implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill")}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const ag={CREDENTIAL_MISMATCH:"custom-token-mismatch",MISSING_CUSTOM_TOKEN:"internal-error",INVALID_IDENTIFIER:"invalid-email",MISSING_CONTINUE_URI:"internal-error",INVALID_PASSWORD:"wrong-password",MISSING_PASSWORD:"missing-password",INVALID_LOGIN_CREDENTIALS:"invalid-credential",EMAIL_EXISTS:"email-already-in-use",PASSWORD_LOGIN_DISABLED:"operation-not-allowed",INVALID_IDP_RESPONSE:"invalid-credential",INVALID_PENDING_TOKEN:"invalid-credential",FEDERATED_USER_ID_ALREADY_LINKED:"credential-already-in-use",MISSING_REQ_TYPE:"internal-error",EMAIL_NOT_FOUND:"user-not-found",RESET_PASSWORD_EXCEED_LIMIT:"too-many-requests",EXPIRED_OOB_CODE:"expired-action-code",INVALID_OOB_CODE:"invalid-action-code",MISSING_OOB_CODE:"internal-error",CREDENTIAL_TOO_OLD_LOGIN_AGAIN:"requires-recent-login",INVALID_ID_TOKEN:"invalid-user-token",TOKEN_EXPIRED:"user-token-expired",USER_NOT_FOUND:"user-token-expired",TOO_MANY_ATTEMPTS_TRY_LATER:"too-many-requests",PASSWORD_DOES_NOT_MEET_REQUIREMENTS:"password-does-not-meet-requirements",INVALID_CODE:"invalid-verification-code",INVALID_SESSION_INFO:"invalid-verification-id",INVALID_TEMPORARY_PROOF:"invalid-credential",MISSING_SESSION_INFO:"missing-verification-id",SESSION_EXPIRED:"code-expired",MISSING_ANDROID_PACKAGE_NAME:"missing-android-pkg-name",UNAUTHORIZED_DOMAIN:"unauthorized-continue-uri",INVALID_OAUTH_CLIENT_ID:"invalid-oauth-client-id",ADMIN_ONLY_OPERATION:"admin-restricted-operation",INVALID_MFA_PENDING_CREDENTIAL:"invalid-multi-factor-session",MFA_ENROLLMENT_NOT_FOUND:"multi-factor-info-not-found",MISSING_MFA_ENROLLMENT_ID:"missing-multi-factor-info",MISSING_MFA_PENDING_CREDENTIAL:"missing-multi-factor-session",SECOND_FACTOR_EXISTS:"second-factor-already-in-use",SECOND_FACTOR_LIMIT_EXCEEDED:"maximum-second-factor-count-exceeded",BLOCKING_FUNCTION_ERROR_RESPONSE:"internal-error",RECAPTCHA_NOT_ENABLED:"recaptcha-not-enabled",MISSING_RECAPTCHA_TOKEN:"missing-recaptcha-token",INVALID_RECAPTCHA_TOKEN:"invalid-recaptcha-token",INVALID_RECAPTCHA_ACTION:"invalid-recaptcha-action",MISSING_CLIENT_TYPE:"missing-client-type",MISSING_RECAPTCHA_VERSION:"missing-recaptcha-version",INVALID_RECAPTCHA_VERSION:"invalid-recaptcha-version",INVALID_REQ_TYPE:"invalid-req-type"};/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const cg=["/v1/accounts:signInWithCustomToken","/v1/accounts:signInWithEmailLink","/v1/accounts:signInWithIdp","/v1/accounts:signInWithPassword","/v1/accounts:signInWithPhoneNumber","/v1/token"],ug=new Ts(3e4,6e4);function wa(n,e){return n.tenantId&&!e.tenantId?{...e,tenantId:n.tenantId}:e}async function ur(n,e,t,r,s={}){return gh(n,s,async()=>{let i={},a={};r&&(e==="GET"?a=r:i={body:JSON.stringify(r)});const c=Es({...a,key:n.config.apiKey}).slice(1),l=await n._getAdditionalHeaders();l["Content-Type"]="application/json",n.languageCode&&(l["X-Firebase-Locale"]=n.languageCode);const f={method:e,headers:l,...i};return jp()||(f.referrerPolicy="strict-origin-when-cross-origin"),n.emulatorConfig&&ws(n.emulatorConfig.host)&&(f.credentials="include"),mh.fetch()(await _h(n,n.config.apiHost,t,c),f)})}async function gh(n,e,t){n._canInitEmulator=!1;const r={...ag,...e};try{const s=new hg(n),i=await Promise.race([t(),s.promise]);s.clearNetworkTimeout();const a=await i.json();if("needConfirmation"in a)throw Ys(n,"account-exists-with-different-credential",a);if(i.ok&&!("errorMessage"in a))return a;{const c=i.ok?a.errorMessage:a.error.message,[l,f]=c.split(" : ");if(l==="FEDERATED_USER_ID_ALREADY_LINKED")throw Ys(n,"credential-already-in-use",a);if(l==="EMAIL_EXISTS")throw Ys(n,"email-already-in-use",a);if(l==="USER_DISABLED")throw Ys(n,"user-disabled",a);const d=r[l]||l.toLowerCase().replace(/[_\s]+/g,"-");if(f)throw Bi(n,d,f);_t(n,d)}}catch(s){if(s instanceof kt)throw s;_t(n,"network-request-failed",{message:String(s)})}}async function lg(n,e,t,r,s={}){const i=await ur(n,e,t,r,s);return"mfaPendingCredential"in i&&_t(n,"multi-factor-auth-required",{_serverResponse:i}),i}async function _h(n,e,t,r){const s=`${e}${t}?${r}`,i=n,a=i.config.emulator?Ea(n.config,s):`${n.config.apiScheme}://${s}`;return cg.includes(t)&&(await i._persistenceManagerAvailable,i._getPersistenceType()==="COOKIE")?i._getPersistence()._getFinalTarget(a).toString():a}class hg{clearNetworkTimeout(){clearTimeout(this.timer)}constructor(e){this.auth=e,this.timer=null,this.promise=new Promise((t,r)=>{this.timer=setTimeout(()=>r(st(this.auth,"network-request-failed")),ug.get())})}}function Ys(n,e,t){const r={appName:n.name};t.email&&(r.email=t.email),t.phoneNumber&&(r.phoneNumber=t.phoneNumber);const s=st(n,e,r);return s.customData._tokenResponse=t,s}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function fg(n,e){return ur(n,"POST","/v1/accounts:delete",e)}async function yi(n,e){return ur(n,"POST","/v1/accounts:lookup",e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function qr(n){if(n)try{const e=new Date(Number(n));if(!isNaN(e.getTime()))return e.toUTCString()}catch{}}async function dg(n,e=!1){const t=$e(n),r=await t.getIdToken(e),s=Ta(r);z(s&&s.exp&&s.auth_time&&s.iat,t.auth,"internal-error");const i=typeof s.firebase=="object"?s.firebase:void 0,a=i==null?void 0:i.sign_in_provider;return{claims:s,token:r,authTime:qr(Oo(s.auth_time)),issuedAtTime:qr(Oo(s.iat)),expirationTime:qr(Oo(s.exp)),signInProvider:a||null,signInSecondFactor:(i==null?void 0:i.sign_in_second_factor)||null}}function Oo(n){return Number(n)*1e3}function Ta(n){const[e,t,r]=n.split(".");if(e===void 0||t===void 0||r===void 0)return si("JWT malformed, contained fewer than 3 sections"),null;try{const s=ih(t);return s?JSON.parse(s):(si("Failed to decode base64 JWT payload"),null)}catch(s){return si("Caught error parsing JWT payload as JSON",s==null?void 0:s.toString()),null}}function Bu(n){const e=Ta(n);return z(e,"internal-error"),z(typeof e.exp<"u","internal-error"),z(typeof e.iat<"u","internal-error"),Number(e.exp)-Number(e.iat)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function Yr(n,e,t=!1){if(t)return e;try{return await e}catch(r){throw yh(r)&&n.auth.currentUser===n&&await n.auth.signOut(),r}}function yh(n){return n instanceof kt?n.code==="auth/user-disabled"||n.code==="auth/user-token-expired":!1}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class pg{constructor(e){this.user=e,this.isRunning=!1,this.timerId=null,this.errorBackoff=3e4}_start(){this.isRunning||(this.isRunning=!0,this.schedule())}_stop(){this.isRunning&&(this.isRunning=!1,this.timerId!==null&&clearTimeout(this.timerId))}getInterval(e){if(e){const t=this.errorBackoff;return this.errorBackoff=Math.min(this.errorBackoff*2,96e4),t}else{this.errorBackoff=3e4;const r=(this.user.stsTokenManager.expirationTime??0)-Date.now()-3e5;return Math.max(0,r)}}schedule(e=!1){if(!this.isRunning)return;const t=this.getInterval(e);this.timerId=setTimeout(async()=>{await this.iteration()},t)}async iteration(){try{await this.user.getIdToken(!0)}catch(e){(e==null?void 0:e.code)==="auth/network-request-failed"&&this.schedule(!0);return}this.schedule()}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ko{constructor(e,t){this.createdAt=e,this.lastLoginAt=t,this._initializeTime()}_initializeTime(){this.lastSignInTime=qr(this.lastLoginAt),this.creationTime=qr(this.createdAt)}_copy(e){this.createdAt=e.createdAt,this.lastLoginAt=e.lastLoginAt,this._initializeTime()}toJSON(){return{createdAt:this.createdAt,lastLoginAt:this.lastLoginAt}}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function Ei(n){var m;const e=n.auth,t=await n.getIdToken(),r=await Yr(n,yi(e,{idToken:t}));z(r==null?void 0:r.users.length,e,"internal-error");const s=r.users[0];n._notifyReloadListener(s);const i=(m=s.providerUserInfo)!=null&&m.length?Eh(s.providerUserInfo):[],a=gg(n.providerData,i),c=n.isAnonymous,l=!(n.email&&s.passwordHash)&&!(a!=null&&a.length),f=c?l:!1,d={uid:s.localId,displayName:s.displayName||null,photoURL:s.photoUrl||null,email:s.email||null,emailVerified:s.emailVerified||!1,phoneNumber:s.phoneNumber||null,tenantId:s.tenantId||null,providerData:a,metadata:new Ko(s.createdAt,s.lastLoginAt),isAnonymous:f};Object.assign(n,d)}async function mg(n){const e=$e(n);await Ei(e),await e.auth._persistUserIfCurrent(e),e.auth._notifyListenersIfCurrent(e)}function gg(n,e){return[...n.filter(r=>!e.some(s=>s.providerId===r.providerId)),...e]}function Eh(n){return n.map(({providerId:e,...t})=>({providerId:e,uid:t.rawId||"",displayName:t.displayName||null,email:t.email||null,phoneNumber:t.phoneNumber||null,photoURL:t.photoUrl||null}))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function _g(n,e){const t=await gh(n,{},async()=>{const r=Es({grant_type:"refresh_token",refresh_token:e}).slice(1),{tokenApiHost:s,apiKey:i}=n.config,a=await _h(n,s,"/v1/token",`key=${i}`),c=await n._getAdditionalHeaders();c["Content-Type"]="application/x-www-form-urlencoded";const l={method:"POST",headers:c,body:r};return n.emulatorConfig&&ws(n.emulatorConfig.host)&&(l.credentials="include"),mh.fetch()(a,l)});return{accessToken:t.access_token,expiresIn:t.expires_in,refreshToken:t.refresh_token}}async function yg(n,e){return ur(n,"POST","/v2/accounts:revokeToken",wa(n,e))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Wn{constructor(){this.refreshToken=null,this.accessToken=null,this.expirationTime=null}get isExpired(){return!this.expirationTime||Date.now()>this.expirationTime-3e4}updateFromServerResponse(e){z(e.idToken,"internal-error"),z(typeof e.idToken<"u","internal-error"),z(typeof e.refreshToken<"u","internal-error");const t="expiresIn"in e&&typeof e.expiresIn<"u"?Number(e.expiresIn):Bu(e.idToken);this.updateTokensAndExpiration(e.idToken,e.refreshToken,t)}updateFromIdToken(e){z(e.length!==0,"internal-error");const t=Bu(e);this.updateTokensAndExpiration(e,null,t)}async getToken(e,t=!1){return!t&&this.accessToken&&!this.isExpired?this.accessToken:(z(this.refreshToken,e,"user-token-expired"),this.refreshToken?(await this.refresh(e,this.refreshToken),this.accessToken):null)}clearRefreshToken(){this.refreshToken=null}async refresh(e,t){const{accessToken:r,refreshToken:s,expiresIn:i}=await _g(e,t);this.updateTokensAndExpiration(r,s,Number(i))}updateTokensAndExpiration(e,t,r){this.refreshToken=t||null,this.accessToken=e||null,this.expirationTime=Date.now()+r*1e3}static fromJSON(e,t){const{refreshToken:r,accessToken:s,expirationTime:i}=t,a=new Wn;return r&&(z(typeof r=="string","internal-error",{appName:e}),a.refreshToken=r),s&&(z(typeof s=="string","internal-error",{appName:e}),a.accessToken=s),i&&(z(typeof i=="number","internal-error",{appName:e}),a.expirationTime=i),a}toJSON(){return{refreshToken:this.refreshToken,accessToken:this.accessToken,expirationTime:this.expirationTime}}_assign(e){this.accessToken=e.accessToken,this.refreshToken=e.refreshToken,this.expirationTime=e.expirationTime}_clone(){return Object.assign(new Wn,this.toJSON())}_performRefresh(){return Tt("not implemented")}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Bt(n,e){z(typeof n=="string"||typeof n>"u","internal-error",{appName:e})}class nt{constructor({uid:e,auth:t,stsTokenManager:r,...s}){this.providerId="firebase",this.proactiveRefresh=new pg(this),this.reloadUserInfo=null,this.reloadListener=null,this.uid=e,this.auth=t,this.stsTokenManager=r,this.accessToken=r.accessToken,this.displayName=s.displayName||null,this.email=s.email||null,this.emailVerified=s.emailVerified||!1,this.phoneNumber=s.phoneNumber||null,this.photoURL=s.photoURL||null,this.isAnonymous=s.isAnonymous||!1,this.tenantId=s.tenantId||null,this.providerData=s.providerData?[...s.providerData]:[],this.metadata=new Ko(s.createdAt||void 0,s.lastLoginAt||void 0)}async getIdToken(e){const t=await Yr(this,this.stsTokenManager.getToken(this.auth,e));return z(t,this.auth,"internal-error"),this.accessToken!==t&&(this.accessToken=t,await this.auth._persistUserIfCurrent(this),this.auth._notifyListenersIfCurrent(this)),t}getIdTokenResult(e){return dg(this,e)}reload(){return mg(this)}_assign(e){this!==e&&(z(this.uid===e.uid,this.auth,"internal-error"),this.displayName=e.displayName,this.photoURL=e.photoURL,this.email=e.email,this.emailVerified=e.emailVerified,this.phoneNumber=e.phoneNumber,this.isAnonymous=e.isAnonymous,this.tenantId=e.tenantId,this.providerData=e.providerData.map(t=>({...t})),this.metadata._copy(e.metadata),this.stsTokenManager._assign(e.stsTokenManager))}_clone(e){const t=new nt({...this,auth:e,stsTokenManager:this.stsTokenManager._clone()});return t.metadata._copy(this.metadata),t}_onReload(e){z(!this.reloadListener,this.auth,"internal-error"),this.reloadListener=e,this.reloadUserInfo&&(this._notifyReloadListener(this.reloadUserInfo),this.reloadUserInfo=null)}_notifyReloadListener(e){this.reloadListener?this.reloadListener(e):this.reloadUserInfo=e}_startProactiveRefresh(){this.proactiveRefresh._start()}_stopProactiveRefresh(){this.proactiveRefresh._stop()}async _updateTokensIfNecessary(e,t=!1){let r=!1;e.idToken&&e.idToken!==this.stsTokenManager.accessToken&&(this.stsTokenManager.updateFromServerResponse(e),r=!0),t&&await Ei(this),await this.auth._persistUserIfCurrent(this),r&&this.auth._notifyListenersIfCurrent(this)}async delete(){if(tt(this.auth.app))return Promise.reject(wn(this.auth));const e=await this.getIdToken();return await Yr(this,fg(this.auth,{idToken:e})),this.stsTokenManager.clearRefreshToken(),this.auth.signOut()}toJSON(){return{uid:this.uid,email:this.email||void 0,emailVerified:this.emailVerified,displayName:this.displayName||void 0,isAnonymous:this.isAnonymous,photoURL:this.photoURL||void 0,phoneNumber:this.phoneNumber||void 0,tenantId:this.tenantId||void 0,providerData:this.providerData.map(e=>({...e})),stsTokenManager:this.stsTokenManager.toJSON(),_redirectEventId:this._redirectEventId,...this.metadata.toJSON(),apiKey:this.auth.config.apiKey,appName:this.auth.name}}get refreshToken(){return this.stsTokenManager.refreshToken||""}static _fromJSON(e,t){const r=t.displayName??void 0,s=t.email??void 0,i=t.phoneNumber??void 0,a=t.photoURL??void 0,c=t.tenantId??void 0,l=t._redirectEventId??void 0,f=t.createdAt??void 0,d=t.lastLoginAt??void 0,{uid:m,emailVerified:I,isAnonymous:V,providerData:x,stsTokenManager:M}=t;z(m&&M,e,"internal-error");const O=Wn.fromJSON(this.name,M);z(typeof m=="string",e,"internal-error"),Bt(r,e.name),Bt(s,e.name),z(typeof I=="boolean",e,"internal-error"),z(typeof V=="boolean",e,"internal-error"),Bt(i,e.name),Bt(a,e.name),Bt(c,e.name),Bt(l,e.name),Bt(f,e.name),Bt(d,e.name);const W=new nt({uid:m,auth:e,email:s,emailVerified:I,displayName:r,isAnonymous:V,photoURL:a,phoneNumber:i,tenantId:c,stsTokenManager:O,createdAt:f,lastLoginAt:d});return x&&Array.isArray(x)&&(W.providerData=x.map(J=>({...J}))),l&&(W._redirectEventId=l),W}static async _fromIdTokenResponse(e,t,r=!1){const s=new Wn;s.updateFromServerResponse(t);const i=new nt({uid:t.localId,auth:e,stsTokenManager:s,isAnonymous:r});return await Ei(i),i}static async _fromGetAccountInfoResponse(e,t,r){const s=t.users[0];z(s.localId!==void 0,"internal-error");const i=s.providerUserInfo!==void 0?Eh(s.providerUserInfo):[],a=!(s.email&&s.passwordHash)&&!(i!=null&&i.length),c=new Wn;c.updateFromIdToken(r);const l=new nt({uid:s.localId,auth:e,stsTokenManager:c,isAnonymous:a}),f={uid:s.localId,displayName:s.displayName||null,photoURL:s.photoUrl||null,email:s.email||null,emailVerified:s.emailVerified||!1,phoneNumber:s.phoneNumber||null,tenantId:s.tenantId||null,providerData:i,metadata:new Ko(s.createdAt,s.lastLoginAt),isAnonymous:!(s.email&&s.passwordHash)&&!(i!=null&&i.length)};return Object.assign(l,f),l}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const qu=new Map;function It(n){St(n instanceof Function,"Expected a class definition");let e=qu.get(n);return e?(St(e instanceof n,"Instance stored in cache mismatched with class"),e):(e=new n,qu.set(n,e),e)}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class wh{constructor(){this.type="NONE",this.storage={}}async _isAvailable(){return!0}async _set(e,t){this.storage[e]=t}async _get(e){const t=this.storage[e];return t===void 0?null:t}async _remove(e){delete this.storage[e]}_addListener(e,t){}_removeListener(e,t){}}wh.type="NONE";const $u=wh;/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function ii(n,e,t){return`firebase:${n}:${e}:${t}`}class Tn{constructor(e,t,r){this.persistence=e,this.auth=t,this.userKey=r;const{config:s,name:i}=this.auth;this.fullUserKey=ii(this.userKey,s.apiKey,i),this.fullPersistenceKey=ii("persistence",s.apiKey,i),this.boundEventHandler=t._onStorageEvent.bind(t);try{this.persistence._addListener(this.fullUserKey,this.boundEventHandler)}catch{}}setCurrentUser(e){return this.persistence._set(this.fullUserKey,e.toJSON())}async getCurrentUser(){const e=await this.persistence._get(this.fullUserKey);if(!e)return null;if(typeof e=="string"){const t=await yi(this.auth,{idToken:e}).catch(()=>{});return t?nt._fromGetAccountInfoResponse(this.auth,t,e):null}return nt._fromJSON(this.auth,e)}removeCurrentUser(){return this.persistence._remove(this.fullUserKey)}savePersistenceForRedirect(){return this.persistence._set(this.fullPersistenceKey,this.persistence.type)}async setPersistence(e){if(this.persistence===e)return;const t=await this.getCurrentUser();if(await this.removeCurrentUser(),this.persistence=e,t)return this.setCurrentUser(t)}delete(){try{this.persistence._removeListener(this.fullUserKey,this.boundEventHandler)}catch{}}static async create(e,t,r="authUser"){if(!t.length)return new Tn(It($u),e,r);const s=(await Promise.all(t.map(async f=>{try{if(await f._isAvailable())return f}catch{return}}))).filter(f=>f);let i=s[0]||It($u);const a=ii(r,e.config.apiKey,e.name);let c=null;for(const f of t)try{const d=await f._get(a);if(d){let m;if(typeof d=="string"){const I=await yi(e,{idToken:d}).catch(()=>{});if(!I)break;m=await nt._fromGetAccountInfoResponse(e,I,d)}else m=nt._fromJSON(e,d);f!==i&&(c=m),i=f;break}}catch{}const l=s.filter(f=>f._shouldAllowMigration);return!i._shouldAllowMigration||!l.length?new Tn(i,e,r):(i=l[0],c&&await i._set(a,c.toJSON()),await Promise.all(t.map(async f=>{if(f!==i)try{await f._remove(a)}catch{}})),new Tn(i,e,r))}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function ju(n){const e=n.toLowerCase();if(e.includes("opera/")||e.includes("opr/")||e.includes("opios/"))return"Opera";if(Ah(e))return"IEMobile";if(e.includes("msie")||e.includes("trident/"))return"IE";if(e.includes("edge/"))return"Edge";if(Th(e))return"Firefox";if(e.includes("silk/"))return"Silk";if(Rh(e))return"Blackberry";if(Ph(e))return"Webos";if(Ih(e))return"Safari";if((e.includes("chrome/")||vh(e))&&!e.includes("edge/"))return"Chrome";if(bh(e))return"Android";{const t=/([a-zA-Z\d\.]+)\/[a-zA-Z\d\.]*$/,r=n.match(t);if((r==null?void 0:r.length)===2)return r[1]}return"Other"}function Th(n=Ne()){return/firefox\//i.test(n)}function Ih(n=Ne()){const e=n.toLowerCase();return e.includes("safari/")&&!e.includes("chrome/")&&!e.includes("crios/")&&!e.includes("android")}function vh(n=Ne()){return/crios\//i.test(n)}function Ah(n=Ne()){return/iemobile/i.test(n)}function bh(n=Ne()){return/android/i.test(n)}function Rh(n=Ne()){return/blackberry/i.test(n)}function Ph(n=Ne()){return/webos/i.test(n)}function Ia(n=Ne()){return/iphone|ipad|ipod/i.test(n)||/macintosh/i.test(n)&&/mobile/i.test(n)}function Eg(n=Ne()){var e;return Ia(n)&&!!((e=window.navigator)!=null&&e.standalone)}function wg(){return Wp()&&document.documentMode===10}function Vh(n=Ne()){return Ia(n)||bh(n)||Ph(n)||Rh(n)||/windows phone/i.test(n)||Ah(n)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Sh(n,e=[]){let t;switch(n){case"Browser":t=ju(Ne());break;case"Worker":t=`${ju(Ne())}-${n}`;break;default:t=n}const r=e.length?e.join(","):"FirebaseCore-web";return`${t}/JsCore/${cr}/${r}`}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Tg{constructor(e){this.auth=e,this.queue=[]}pushCallback(e,t){const r=i=>new Promise((a,c)=>{try{const l=e(i);a(l)}catch(l){c(l)}});r.onAbort=t,this.queue.push(r);const s=this.queue.length-1;return()=>{this.queue[s]=()=>Promise.resolve()}}async runMiddleware(e){if(this.auth.currentUser===e)return;const t=[];try{for(const r of this.queue)await r(e),r.onAbort&&t.push(r.onAbort)}catch(r){t.reverse();for(const s of t)try{s()}catch{}throw this.auth._errorFactory.create("login-blocked",{originalMessage:r==null?void 0:r.message})}}}/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function Ig(n,e={}){return ur(n,"GET","/v2/passwordPolicy",wa(n,e))}/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const vg=6;class Ag{constructor(e){var r;const t=e.customStrengthOptions;this.customStrengthOptions={},this.customStrengthOptions.minPasswordLength=t.minPasswordLength??vg,t.maxPasswordLength&&(this.customStrengthOptions.maxPasswordLength=t.maxPasswordLength),t.containsLowercaseCharacter!==void 0&&(this.customStrengthOptions.containsLowercaseLetter=t.containsLowercaseCharacter),t.containsUppercaseCharacter!==void 0&&(this.customStrengthOptions.containsUppercaseLetter=t.containsUppercaseCharacter),t.containsNumericCharacter!==void 0&&(this.customStrengthOptions.containsNumericCharacter=t.containsNumericCharacter),t.containsNonAlphanumericCharacter!==void 0&&(this.customStrengthOptions.containsNonAlphanumericCharacter=t.containsNonAlphanumericCharacter),this.enforcementState=e.enforcementState,this.enforcementState==="ENFORCEMENT_STATE_UNSPECIFIED"&&(this.enforcementState="OFF"),this.allowedNonAlphanumericCharacters=((r=e.allowedNonAlphanumericCharacters)==null?void 0:r.join(""))??"",this.forceUpgradeOnSignin=e.forceUpgradeOnSignin??!1,this.schemaVersion=e.schemaVersion}validatePassword(e){const t={isValid:!0,passwordPolicy:this};return this.validatePasswordLengthOptions(e,t),this.validatePasswordCharacterOptions(e,t),t.isValid&&(t.isValid=t.meetsMinPasswordLength??!0),t.isValid&&(t.isValid=t.meetsMaxPasswordLength??!0),t.isValid&&(t.isValid=t.containsLowercaseLetter??!0),t.isValid&&(t.isValid=t.containsUppercaseLetter??!0),t.isValid&&(t.isValid=t.containsNumericCharacter??!0),t.isValid&&(t.isValid=t.containsNonAlphanumericCharacter??!0),t}validatePasswordLengthOptions(e,t){const r=this.customStrengthOptions.minPasswordLength,s=this.customStrengthOptions.maxPasswordLength;r&&(t.meetsMinPasswordLength=e.length>=r),s&&(t.meetsMaxPasswordLength=e.length<=s)}validatePasswordCharacterOptions(e,t){this.updatePasswordCharacterOptionsStatuses(t,!1,!1,!1,!1);let r;for(let s=0;s<e.length;s++)r=e.charAt(s),this.updatePasswordCharacterOptionsStatuses(t,r>="a"&&r<="z",r>="A"&&r<="Z",r>="0"&&r<="9",this.allowedNonAlphanumericCharacters.includes(r))}updatePasswordCharacterOptionsStatuses(e,t,r,s,i){this.customStrengthOptions.containsLowercaseLetter&&(e.containsLowercaseLetter||(e.containsLowercaseLetter=t)),this.customStrengthOptions.containsUppercaseLetter&&(e.containsUppercaseLetter||(e.containsUppercaseLetter=r)),this.customStrengthOptions.containsNumericCharacter&&(e.containsNumericCharacter||(e.containsNumericCharacter=s)),this.customStrengthOptions.containsNonAlphanumericCharacter&&(e.containsNonAlphanumericCharacter||(e.containsNonAlphanumericCharacter=i))}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class bg{constructor(e,t,r,s){this.app=e,this.heartbeatServiceProvider=t,this.appCheckServiceProvider=r,this.config=s,this.currentUser=null,this.emulatorConfig=null,this.operations=Promise.resolve(),this.authStateSubscription=new zu(this),this.idTokenSubscription=new zu(this),this.beforeStateQueue=new Tg(this),this.redirectUser=null,this.isProactiveRefreshEnabled=!1,this.EXPECTED_PASSWORD_POLICY_SCHEMA_VERSION=1,this._canInitEmulator=!0,this._isInitialized=!1,this._deleted=!1,this._initializationPromise=null,this._popupRedirectResolver=null,this._errorFactory=ph,this._agentRecaptchaConfig=null,this._tenantRecaptchaConfigs={},this._projectPasswordPolicy=null,this._tenantPasswordPolicies={},this._resolvePersistenceManagerAvailable=void 0,this.lastNotifiedUid=void 0,this.languageCode=null,this.tenantId=null,this.settings={appVerificationDisabledForTesting:!1},this.frameworks=[],this.name=e.name,this.clientVersion=s.sdkClientVersion,this._persistenceManagerAvailable=new Promise(i=>this._resolvePersistenceManagerAvailable=i)}_initializeWithPersistence(e,t){return t&&(this._popupRedirectResolver=It(t)),this._initializationPromise=this.queue(async()=>{var r,s,i;if(!this._deleted){try{this.persistenceManager=await Tn.create(this,e)}catch(a){ri(`Failed to initialize persistence: ${a}`),this.persistenceManager=await Tn.create(this,[])}finally{(r=this._resolvePersistenceManagerAvailable)==null||r.call(this)}if(!this._deleted){if((s=this._popupRedirectResolver)!=null&&s._shouldInitProactively)try{await this._popupRedirectResolver._initialize(this)}catch{}try{await this.initializeCurrentUser(t)}catch(a){ri(`Failed to initialize current user: ${a}`),await this.directlySetCurrentUser(null).catch(()=>{})}this.lastNotifiedUid=((i=this.currentUser)==null?void 0:i.uid)||null,!this._deleted&&(this._isInitialized=!0)}}}),this._initializationPromise}async _onStorageEvent(){if(this._deleted)return;const e=await this.assertedPersistence.getCurrentUser();if(!(!this.currentUser&&!e)){if(this.currentUser&&e&&this.currentUser.uid===e.uid){this._currentUser._assign(e),await this.currentUser.getIdToken();return}await this._updateCurrentUser(e,!0)}}async initializeCurrentUserFromIdToken(e){try{const t=await yi(this,{idToken:e}),r=await nt._fromGetAccountInfoResponse(this,t,e);await this.directlySetCurrentUser(r)}catch(t){console.warn("FirebaseServerApp could not login user with provided authIdToken: ",t),await this.directlySetCurrentUser(null)}}async initializeCurrentUser(e){var i;if(tt(this.app)){const a=this.app.settings.authIdToken;return a?new Promise(c=>{setTimeout(()=>this.initializeCurrentUserFromIdToken(a).then(c,c))}):this.directlySetCurrentUser(null)}const t=await this.assertedPersistence.getCurrentUser();let r=t,s=!1;if(e&&this.config.authDomain){await this.getOrInitRedirectPersistenceManager();const a=(i=this.redirectUser)==null?void 0:i._redirectEventId,c=r==null?void 0:r._redirectEventId,l=await this.tryRedirectSignIn(e);(!a||a===c)&&(l!=null&&l.user)&&(r=l.user,s=!0)}if(!r)return this.directlySetCurrentUser(null);if(!r._redirectEventId){if(s)try{await this.beforeStateQueue.runMiddleware(r)}catch(a){r=t,this._popupRedirectResolver._overrideRedirectResult(this,()=>Promise.reject(a))}return r?this.reloadAndSetCurrentUserOrClear(r):this.directlySetCurrentUser(null)}return z(this._popupRedirectResolver,this,"argument-error"),await this.getOrInitRedirectPersistenceManager(),this.redirectUser&&this.redirectUser._redirectEventId===r._redirectEventId?this.directlySetCurrentUser(r):this.reloadAndSetCurrentUserOrClear(r)}async tryRedirectSignIn(e){let t=null;try{t=await this._popupRedirectResolver._completeRedirectFn(this,e,!0)}catch{await this._setRedirectUser(null)}return t}async reloadAndSetCurrentUserOrClear(e){try{await Ei(e)}catch(t){if(yh(t))return this.directlySetCurrentUser(null)}return this.directlySetCurrentUser(e)}useDeviceLanguage(){this.languageCode=og()}async _delete(){this._deleted=!0}async updateCurrentUser(e){if(tt(this.app))return Promise.reject(wn(this));const t=e?$e(e):null;return t&&z(t.auth.config.apiKey===this.config.apiKey,this,"invalid-user-token"),this._updateCurrentUser(t&&t._clone(this))}async _updateCurrentUser(e,t=!1){if(!this._deleted)return e&&z(this.tenantId===e.tenantId,this,"tenant-id-mismatch"),t||await this.beforeStateQueue.runMiddleware(e),this.queue(async()=>{await this.directlySetCurrentUser(e),this.notifyAuthListeners()})}async signOut(){return tt(this.app)?Promise.reject(wn(this)):(await this.beforeStateQueue.runMiddleware(null),(this.redirectPersistenceManager||this._popupRedirectResolver)&&await this._setRedirectUser(null),this._updateCurrentUser(null,!0))}setPersistence(e){return tt(this.app)?Promise.reject(wn(this)):this.queue(async()=>{await this.assertedPersistence.setPersistence(It(e))})}_getRecaptchaConfig(){return this.tenantId==null?this._agentRecaptchaConfig:this._tenantRecaptchaConfigs[this.tenantId]}async validatePassword(e){this._getPasswordPolicyInternal()||await this._updatePasswordPolicy();const t=this._getPasswordPolicyInternal();return t.schemaVersion!==this.EXPECTED_PASSWORD_POLICY_SCHEMA_VERSION?Promise.reject(this._errorFactory.create("unsupported-password-policy-schema-version",{})):t.validatePassword(e)}_getPasswordPolicyInternal(){return this.tenantId===null?this._projectPasswordPolicy:this._tenantPasswordPolicies[this.tenantId]}async _updatePasswordPolicy(){const e=await Ig(this),t=new Ag(e);this.tenantId===null?this._projectPasswordPolicy=t:this._tenantPasswordPolicies[this.tenantId]=t}_getPersistenceType(){return this.assertedPersistence.persistence.type}_getPersistence(){return this.assertedPersistence.persistence}_updateErrorMap(e){this._errorFactory=new ys("auth","Firebase",e())}onAuthStateChanged(e,t,r){return this.registerStateListener(this.authStateSubscription,e,t,r)}beforeAuthStateChanged(e,t){return this.beforeStateQueue.pushCallback(e,t)}onIdTokenChanged(e,t,r){return this.registerStateListener(this.idTokenSubscription,e,t,r)}authStateReady(){return new Promise((e,t)=>{if(this.currentUser)e();else{const r=this.onAuthStateChanged(()=>{r(),e()},t)}})}async revokeAccessToken(e){if(this.currentUser){const t=await this.currentUser.getIdToken(),r={providerId:"apple.com",tokenType:"ACCESS_TOKEN",token:e,idToken:t};this.tenantId!=null&&(r.tenantId=this.tenantId),await yg(this,r)}}toJSON(){var e;return{apiKey:this.config.apiKey,authDomain:this.config.authDomain,appName:this.name,currentUser:(e=this._currentUser)==null?void 0:e.toJSON()}}async _setRedirectUser(e,t){const r=await this.getOrInitRedirectPersistenceManager(t);return e===null?r.removeCurrentUser():r.setCurrentUser(e)}async getOrInitRedirectPersistenceManager(e){if(!this.redirectPersistenceManager){const t=e&&It(e)||this._popupRedirectResolver;z(t,this,"argument-error"),this.redirectPersistenceManager=await Tn.create(this,[It(t._redirectPersistence)],"redirectUser"),this.redirectUser=await this.redirectPersistenceManager.getCurrentUser()}return this.redirectPersistenceManager}async _redirectUserForId(e){var t,r;return this._isInitialized&&await this.queue(async()=>{}),((t=this._currentUser)==null?void 0:t._redirectEventId)===e?this._currentUser:((r=this.redirectUser)==null?void 0:r._redirectEventId)===e?this.redirectUser:null}async _persistUserIfCurrent(e){if(e===this.currentUser)return this.queue(async()=>this.directlySetCurrentUser(e))}_notifyListenersIfCurrent(e){e===this.currentUser&&this.notifyAuthListeners()}_key(){return`${this.config.authDomain}:${this.config.apiKey}:${this.name}`}_startProactiveRefresh(){this.isProactiveRefreshEnabled=!0,this.currentUser&&this._currentUser._startProactiveRefresh()}_stopProactiveRefresh(){this.isProactiveRefreshEnabled=!1,this.currentUser&&this._currentUser._stopProactiveRefresh()}get _currentUser(){return this.currentUser}notifyAuthListeners(){var t;if(!this._isInitialized)return;this.idTokenSubscription.next(this.currentUser);const e=((t=this.currentUser)==null?void 0:t.uid)??null;this.lastNotifiedUid!==e&&(this.lastNotifiedUid=e,this.authStateSubscription.next(this.currentUser))}registerStateListener(e,t,r,s){if(this._deleted)return()=>{};const i=typeof t=="function"?t:t.next.bind(t);let a=!1;const c=this._isInitialized?Promise.resolve():this._initializationPromise;if(z(c,this,"internal-error"),c.then(()=>{a||i(this.currentUser)}).catch(l=>{if(!a)if(typeof t!="function"&&t.error)t.error(l);else if(r)r(l);else throw l}),typeof t=="function"){const l=e.addObserver(t,r,s);return()=>{a=!0,l()}}else{const l=e.addObserver(t);return()=>{a=!0,l()}}}async directlySetCurrentUser(e){if(this.currentUser&&this.currentUser!==e&&this._currentUser._stopProactiveRefresh(),e&&this.isProactiveRefreshEnabled&&e._startProactiveRefresh(),this.currentUser=e,this.persistenceManager)try{e?await this.persistenceManager.setCurrentUser(e):await this.persistenceManager.removeCurrentUser()}catch(t){const r=(t==null?void 0:t.message)||String(t),s=Bi(this,"internal-error",`An internal AuthError has occurred: ${r}`);throw s.customData={originalError:t},s}}queue(e){return this.operations=this.operations.then(e,e),this.operations}get assertedPersistence(){return z(this.persistenceManager,this,"internal-error"),this.persistenceManager}_logFramework(e){!e||this.frameworks.includes(e)||(this.frameworks.push(e),this.frameworks.sort(),this.clientVersion=Sh(this.config.clientPlatform,this._getFrameworks()))}_getFrameworks(){return this.frameworks}async _getAdditionalHeaders(){var s;const e={"X-Client-Version":this.clientVersion};this.app.options.appId&&(e["X-Firebase-gmpid"]=this.app.options.appId);const t=await((s=this.heartbeatServiceProvider.getImmediate({optional:!0}))==null?void 0:s.getHeartbeatsHeader());t&&(e["X-Firebase-Client"]=t);const r=await this._getAppCheckToken();return r&&(e["X-Firebase-AppCheck"]=r),e}async _getAppCheckToken(){var t;if(tt(this.app)&&this.app.settings.appCheckToken)return this.app.settings.appCheckToken;const e=await((t=this.appCheckServiceProvider.getImmediate({optional:!0}))==null?void 0:t.getToken());return e!=null&&e.error&&ri(`Error while retrieving App Check token: ${e.error}`),e==null?void 0:e.token}}function qi(n){return $e(n)}class zu{constructor(e){this.auth=e,this.observer=null,this.addObserver=Zp(t=>this.observer=t)}get next(){return z(this.observer,this.auth,"internal-error"),this.observer.next.bind(this.observer)}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let va={async loadJS(){throw new Error("Unable to load external scripts")},recaptchaV2Script:"",recaptchaEnterpriseScript:"",gapiScript:""};function Rg(n){va=n}function Pg(n){return va.loadJS(n)}function Vg(){return va.gapiScript}function Sg(n){return`__${n}${Math.floor(Math.random()*1e6)}`}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Cg(n,e){const t=_a(n,"auth");if(t.isInitialized()){const s=t.getImmediate(),i=t.getOptions();if(bn(i,e??{}))return s;_t(s,"already-initialized")}return t.initialize({options:e})}function xg(n,e){const t=(e==null?void 0:e.persistence)||[],r=(Array.isArray(t)?t:[t]).map(It);e!=null&&e.errorMap&&n._updateErrorMap(e.errorMap),n._initializeWithPersistence(r,e==null?void 0:e.popupRedirectResolver)}function Ng(n,e,t){const r=qi(n);z(/^https?:\/\//.test(e),r,"invalid-emulator-scheme");const s=!1,i=Ch(e),{host:a,port:c}=kg(e),l=c===null?"":`:${c}`,f={url:`${i}//${a}${l}/`},d=Object.freeze({host:a,port:c,protocol:i.replace(":",""),options:Object.freeze({disableWarnings:s})});if(!r._canInitEmulator){z(r.config.emulator&&r.emulatorConfig,r,"emulator-config-failed"),z(bn(f,r.config.emulator)&&bn(d,r.emulatorConfig),r,"emulator-config-failed");return}r.config.emulator=f,r.emulatorConfig=d,r.settings.appVerificationDisabledForTesting=!0,ws(a)?uh(`${i}//${a}${l}`):Dg()}function Ch(n){const e=n.indexOf(":");return e<0?"":n.substr(0,e+1)}function kg(n){const e=Ch(n),t=/(\/\/)?([^?#/]+)/.exec(n.substr(e.length));if(!t)return{host:"",port:null};const r=t[2].split("@").pop()||"",s=/^(\[[^\]]+\])(:|$)/.exec(r);if(s){const i=s[1];return{host:i,port:Gu(r.substr(i.length+1))}}else{const[i,a]=r.split(":");return{host:i,port:Gu(a)}}}function Gu(n){if(!n)return null;const e=Number(n);return isNaN(e)?null:e}function Dg(){function n(){const e=document.createElement("p"),t=e.style;e.innerText="Running in emulator mode. Do not use with production credentials.",t.position="fixed",t.width="100%",t.backgroundColor="#ffffff",t.border=".1em solid #000000",t.color="#b50000",t.bottom="0px",t.left="0px",t.margin="0px",t.zIndex="10000",t.textAlign="center",e.classList.add("firebase-emulator-warning"),document.body.appendChild(e)}typeof console<"u"&&typeof console.info=="function"&&console.info("WARNING: You are using the Auth Emulator, which is intended for local testing only.  Do not use with production credentials."),typeof window<"u"&&typeof document<"u"&&(document.readyState==="loading"?window.addEventListener("DOMContentLoaded",n):n())}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class xh{constructor(e,t){this.providerId=e,this.signInMethod=t}toJSON(){return Tt("not implemented")}_getIdTokenResponse(e){return Tt("not implemented")}_linkToIdToken(e,t){return Tt("not implemented")}_getReauthenticationResolver(e){return Tt("not implemented")}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function Hn(n,e){return lg(n,"POST","/v1/accounts:signInWithIdp",wa(n,e))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Og="http://localhost";class Pn extends xh{constructor(){super(...arguments),this.pendingToken=null}static _fromParams(e){const t=new Pn(e.providerId,e.signInMethod);return e.idToken||e.accessToken?(e.idToken&&(t.idToken=e.idToken),e.accessToken&&(t.accessToken=e.accessToken),e.nonce&&!e.pendingToken&&(t.nonce=e.nonce),e.pendingToken&&(t.pendingToken=e.pendingToken)):e.oauthToken&&e.oauthTokenSecret?(t.accessToken=e.oauthToken,t.secret=e.oauthTokenSecret):_t("argument-error"),t}toJSON(){return{idToken:this.idToken,accessToken:this.accessToken,secret:this.secret,nonce:this.nonce,pendingToken:this.pendingToken,providerId:this.providerId,signInMethod:this.signInMethod}}static fromJSON(e){const t=typeof e=="string"?JSON.parse(e):e,{providerId:r,signInMethod:s,...i}=t;if(!r||!s)return null;const a=new Pn(r,s);return a.idToken=i.idToken||void 0,a.accessToken=i.accessToken||void 0,a.secret=i.secret,a.nonce=i.nonce,a.pendingToken=i.pendingToken||null,a}_getIdTokenResponse(e){const t=this.buildRequest();return Hn(e,t)}_linkToIdToken(e,t){const r=this.buildRequest();return r.idToken=t,Hn(e,r)}_getReauthenticationResolver(e){const t=this.buildRequest();return t.autoCreate=!1,Hn(e,t)}buildRequest(){const e={requestUri:Og,returnSecureToken:!0};if(this.pendingToken)e.pendingToken=this.pendingToken;else{const t={};this.idToken&&(t.id_token=this.idToken),this.accessToken&&(t.access_token=this.accessToken),this.secret&&(t.oauth_token_secret=this.secret),t.providerId=this.providerId,this.nonce&&!this.pendingToken&&(t.nonce=this.nonce),e.postBody=Es(t)}return e}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Aa{constructor(e){this.providerId=e,this.defaultLanguageCode=null,this.customParameters={}}setDefaultLanguage(e){this.defaultLanguageCode=e}setCustomParameters(e){return this.customParameters=e,this}getCustomParameters(){return this.customParameters}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Is extends Aa{constructor(){super(...arguments),this.scopes=[]}addScope(e){return this.scopes.includes(e)||this.scopes.push(e),this}getScopes(){return[...this.scopes]}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class qt extends Is{constructor(){super("facebook.com")}static credential(e){return Pn._fromParams({providerId:qt.PROVIDER_ID,signInMethod:qt.FACEBOOK_SIGN_IN_METHOD,accessToken:e})}static credentialFromResult(e){return qt.credentialFromTaggedObject(e)}static credentialFromError(e){return qt.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e||!("oauthAccessToken"in e)||!e.oauthAccessToken)return null;try{return qt.credential(e.oauthAccessToken)}catch{return null}}}qt.FACEBOOK_SIGN_IN_METHOD="facebook.com";qt.PROVIDER_ID="facebook.com";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class $t extends Is{constructor(){super("google.com"),this.addScope("profile")}static credential(e,t){return Pn._fromParams({providerId:$t.PROVIDER_ID,signInMethod:$t.GOOGLE_SIGN_IN_METHOD,idToken:e,accessToken:t})}static credentialFromResult(e){return $t.credentialFromTaggedObject(e)}static credentialFromError(e){return $t.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e)return null;const{oauthIdToken:t,oauthAccessToken:r}=e;if(!t&&!r)return null;try{return $t.credential(t,r)}catch{return null}}}$t.GOOGLE_SIGN_IN_METHOD="google.com";$t.PROVIDER_ID="google.com";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class jt extends Is{constructor(){super("github.com")}static credential(e){return Pn._fromParams({providerId:jt.PROVIDER_ID,signInMethod:jt.GITHUB_SIGN_IN_METHOD,accessToken:e})}static credentialFromResult(e){return jt.credentialFromTaggedObject(e)}static credentialFromError(e){return jt.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e||!("oauthAccessToken"in e)||!e.oauthAccessToken)return null;try{return jt.credential(e.oauthAccessToken)}catch{return null}}}jt.GITHUB_SIGN_IN_METHOD="github.com";jt.PROVIDER_ID="github.com";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class zt extends Is{constructor(){super("twitter.com")}static credential(e,t){return Pn._fromParams({providerId:zt.PROVIDER_ID,signInMethod:zt.TWITTER_SIGN_IN_METHOD,oauthToken:e,oauthTokenSecret:t})}static credentialFromResult(e){return zt.credentialFromTaggedObject(e)}static credentialFromError(e){return zt.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e)return null;const{oauthAccessToken:t,oauthTokenSecret:r}=e;if(!t||!r)return null;try{return zt.credential(t,r)}catch{return null}}}zt.TWITTER_SIGN_IN_METHOD="twitter.com";zt.PROVIDER_ID="twitter.com";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Xn{constructor(e){this.user=e.user,this.providerId=e.providerId,this._tokenResponse=e._tokenResponse,this.operationType=e.operationType}static async _fromIdTokenResponse(e,t,r,s=!1){const i=await nt._fromIdTokenResponse(e,r,s),a=Wu(r);return new Xn({user:i,providerId:a,_tokenResponse:r,operationType:t})}static async _forOperation(e,t,r){await e._updateTokensIfNecessary(r,!0);const s=Wu(r);return new Xn({user:e,providerId:s,_tokenResponse:r,operationType:t})}}function Wu(n){return n.providerId?n.providerId:"phoneNumber"in n?"phone":null}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class wi extends kt{constructor(e,t,r,s){super(t.code,t.message),this.operationType=r,this.user=s,Object.setPrototypeOf(this,wi.prototype),this.customData={appName:e.name,tenantId:e.tenantId??void 0,_serverResponse:t.customData._serverResponse,operationType:r}}static _fromErrorAndOperation(e,t,r,s){return new wi(e,t,r,s)}}function Nh(n,e,t,r){return(e==="reauthenticate"?t._getReauthenticationResolver(n):t._getIdTokenResponse(n)).catch(i=>{throw i.code==="auth/multi-factor-auth-required"?wi._fromErrorAndOperation(n,i,e,r):i})}async function Lg(n,e,t=!1){const r=await Yr(n,e._linkToIdToken(n.auth,await n.getIdToken()),t);return Xn._forOperation(n,"link",r)}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function Mg(n,e,t=!1){const{auth:r}=n;if(tt(r.app))return Promise.reject(wn(r));const s="reauthenticate";try{const i=await Yr(n,Nh(r,s,e,n),t);z(i.idToken,r,"internal-error");const a=Ta(i.idToken);z(a,r,"internal-error");const{sub:c}=a;return z(n.uid===c,r,"user-mismatch"),Xn._forOperation(n,s,i)}catch(i){throw(i==null?void 0:i.code)==="auth/user-not-found"&&_t(r,"user-mismatch"),i}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function Ug(n,e,t=!1){if(tt(n.app))return Promise.reject(wn(n));const r="signIn",s=await Nh(n,r,e),i=await Xn._fromIdTokenResponse(n,r,s);return t||await n._updateCurrentUser(i.user),i}function Fg(n,e,t,r){return $e(n).onIdTokenChanged(e,t,r)}function Bg(n,e,t){return $e(n).beforeAuthStateChanged(e,t)}function Q0(n,e,t,r){return $e(n).onAuthStateChanged(e,t,r)}const Ti="__sak";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class kh{constructor(e,t){this.storageRetriever=e,this.type=t}_isAvailable(){try{return this.storage?(this.storage.setItem(Ti,"1"),this.storage.removeItem(Ti),Promise.resolve(!0)):Promise.resolve(!1)}catch{return Promise.resolve(!1)}}_set(e,t){return this.storage.setItem(e,JSON.stringify(t)),Promise.resolve()}_get(e){const t=this.storage.getItem(e);return Promise.resolve(t?JSON.parse(t):null)}_remove(e){return this.storage.removeItem(e),Promise.resolve()}get storage(){return this.storageRetriever()}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const qg=1e3,$g=10;class Dh extends kh{constructor(){super(()=>window.localStorage,"LOCAL"),this.boundEventHandler=(e,t)=>this.onStorageEvent(e,t),this.listeners={},this.localCache={},this.pollTimer=null,this.fallbackToPolling=Vh(),this._shouldAllowMigration=!0}forAllChangedKeys(e){for(const t of Object.keys(this.listeners)){const r=this.storage.getItem(t),s=this.localCache[t];r!==s&&e(t,s,r)}}onStorageEvent(e,t=!1){if(!e.key){this.forAllChangedKeys((a,c,l)=>{this.notifyListeners(a,l)});return}const r=e.key;t?this.detachListener():this.stopPolling();const s=()=>{const a=this.storage.getItem(r);!t&&this.localCache[r]===a||this.notifyListeners(r,a)},i=this.storage.getItem(r);wg()&&i!==e.newValue&&e.newValue!==e.oldValue?setTimeout(s,$g):s()}notifyListeners(e,t){this.localCache[e]=t;const r=this.listeners[e];if(r)for(const s of Array.from(r))s(t&&JSON.parse(t))}startPolling(){this.stopPolling(),this.pollTimer=setInterval(()=>{this.forAllChangedKeys((e,t,r)=>{this.onStorageEvent(new StorageEvent("storage",{key:e,oldValue:t,newValue:r}),!0)})},qg)}stopPolling(){this.pollTimer&&(clearInterval(this.pollTimer),this.pollTimer=null)}attachListener(){window.addEventListener("storage",this.boundEventHandler)}detachListener(){window.removeEventListener("storage",this.boundEventHandler)}_addListener(e,t){Object.keys(this.listeners).length===0&&(this.fallbackToPolling?this.startPolling():this.attachListener()),this.listeners[e]||(this.listeners[e]=new Set,this.localCache[e]=this.storage.getItem(e)),this.listeners[e].add(t)}_removeListener(e,t){this.listeners[e]&&(this.listeners[e].delete(t),this.listeners[e].size===0&&delete this.listeners[e]),Object.keys(this.listeners).length===0&&(this.detachListener(),this.stopPolling())}async _set(e,t){await super._set(e,t),this.localCache[e]=JSON.stringify(t)}async _get(e){const t=await super._get(e);return this.localCache[e]=JSON.stringify(t),t}async _remove(e){await super._remove(e),delete this.localCache[e]}}Dh.type="LOCAL";const jg=Dh;/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Oh extends kh{constructor(){super(()=>window.sessionStorage,"SESSION")}_addListener(e,t){}_removeListener(e,t){}}Oh.type="SESSION";const Lh=Oh;/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function zg(n){return Promise.all(n.map(async e=>{try{return{fulfilled:!0,value:await e}}catch(t){return{fulfilled:!1,reason:t}}}))}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class $i{constructor(e){this.eventTarget=e,this.handlersMap={},this.boundEventHandler=this.handleEvent.bind(this)}static _getInstance(e){const t=this.receivers.find(s=>s.isListeningto(e));if(t)return t;const r=new $i(e);return this.receivers.push(r),r}isListeningto(e){return this.eventTarget===e}async handleEvent(e){const t=e,{eventId:r,eventType:s,data:i}=t.data,a=this.handlersMap[s];if(!(a!=null&&a.size))return;t.ports[0].postMessage({status:"ack",eventId:r,eventType:s});const c=Array.from(a).map(async f=>f(t.origin,i)),l=await zg(c);t.ports[0].postMessage({status:"done",eventId:r,eventType:s,response:l})}_subscribe(e,t){Object.keys(this.handlersMap).length===0&&this.eventTarget.addEventListener("message",this.boundEventHandler),this.handlersMap[e]||(this.handlersMap[e]=new Set),this.handlersMap[e].add(t)}_unsubscribe(e,t){this.handlersMap[e]&&t&&this.handlersMap[e].delete(t),(!t||this.handlersMap[e].size===0)&&delete this.handlersMap[e],Object.keys(this.handlersMap).length===0&&this.eventTarget.removeEventListener("message",this.boundEventHandler)}}$i.receivers=[];/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function ba(n="",e=10){let t="";for(let r=0;r<e;r++)t+=Math.floor(Math.random()*10);return n+t}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Gg{constructor(e){this.target=e,this.handlers=new Set}removeMessageHandler(e){e.messageChannel&&(e.messageChannel.port1.removeEventListener("message",e.onMessage),e.messageChannel.port1.close()),this.handlers.delete(e)}async _send(e,t,r=50){const s=typeof MessageChannel<"u"?new MessageChannel:null;if(!s)throw new Error("connection_unavailable");let i,a;return new Promise((c,l)=>{const f=ba("",20);s.port1.start();const d=setTimeout(()=>{l(new Error("unsupported_event"))},r);a={messageChannel:s,onMessage(m){const I=m;if(I.data.eventId===f)switch(I.data.status){case"ack":clearTimeout(d),i=setTimeout(()=>{l(new Error("timeout"))},3e3);break;case"done":clearTimeout(i),c(I.data.response);break;default:clearTimeout(d),clearTimeout(i),l(new Error("invalid_response"));break}}},this.handlers.add(a),s.port1.addEventListener("message",a.onMessage),this.target.postMessage({eventType:e,eventId:f,data:t},[s.port2])}).finally(()=>{a&&this.removeMessageHandler(a)})}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function ft(){return window}function Wg(n){ft().location.href=n}/**
 * @license
 * Copyright 2020 Google LLC.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Mh(){return typeof ft().WorkerGlobalScope<"u"&&typeof ft().importScripts=="function"}async function Hg(){if(!(navigator!=null&&navigator.serviceWorker))return null;try{return(await navigator.serviceWorker.ready).active}catch{return null}}function Kg(){var n;return((n=navigator==null?void 0:navigator.serviceWorker)==null?void 0:n.controller)||null}function Qg(){return Mh()?self:null}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Uh="firebaseLocalStorageDb",Yg=1,Ii="firebaseLocalStorage",Fh="fbase_key";class vs{constructor(e){this.request=e}toPromise(){return new Promise((e,t)=>{this.request.addEventListener("success",()=>{e(this.request.result)}),this.request.addEventListener("error",()=>{t(this.request.error)})})}}function ji(n,e){return n.transaction([Ii],e?"readwrite":"readonly").objectStore(Ii)}function Jg(){const n=indexedDB.deleteDatabase(Uh);return new vs(n).toPromise()}function Bh(){const n=indexedDB.open(Uh,Yg);return new Promise((e,t)=>{n.addEventListener("error",()=>{t(n.error)}),n.addEventListener("upgradeneeded",()=>{const r=n.result;try{r.createObjectStore(Ii,{keyPath:Fh})}catch(s){t(s)}}),n.addEventListener("success",async()=>{const r=n.result;r.objectStoreNames.contains(Ii)?e(r):(r.close(),await Jg(),e(await Bh()))})})}async function Hu(n,e,t){const r=ji(n,!0).put({[Fh]:e,value:t});return new vs(r).toPromise()}async function Xg(n,e){const t=ji(n,!1).get(e),r=await new vs(t).toPromise();return r===void 0?null:r.value}function Ku(n,e){const t=ji(n,!0).delete(e);return new vs(t).toPromise()}const Zg=800,e_=3;class qh{registerLifecycleListeners(){typeof window<"u"&&typeof window.addEventListener=="function"&&(window.addEventListener("pagehide",this.onPageHide),window.addEventListener("pageshow",this.onPageShow))}unregisterLifecycleListeners(){typeof window<"u"&&typeof window.removeEventListener=="function"&&(window.removeEventListener("pagehide",this.onPageHide),window.removeEventListener("pageshow",this.onPageShow))}constructor(){this.type="LOCAL",this.dbPromise=null,this._shouldAllowMigration=!0,this.listeners={},this.localCache={},this.pollTimer=null,this.isClosing=!1,this.pendingWrites=0,this.receiver=null,this.sender=null,this.serviceWorkerReceiverAvailable=!1,this.activeServiceWorker=null,this.onPageHide=()=>{this.isClosing=!0,this.stopPolling(),this.dbPromise&&(this.dbPromise.then(e=>e.close()).catch(()=>{}),this.dbPromise=null)},this.onPageShow=()=>{this.isClosing&&(this.isClosing=!1,Object.keys(this.listeners).length>0&&this.startPolling())},this._workerInitializationPromise=this.initializeServiceWorkerMessaging().then(()=>{},()=>{})}async _openDb(){return this.dbPromise?this.dbPromise:(this.dbPromise=Bh(),this.dbPromise.catch(()=>{this.dbPromise=null}),this.dbPromise)}async _withRetries(e){let t=0;for(;;)try{const r=await this._openDb();return await e(r)}catch(r){if(t++>e_)throw r;if(this.dbPromise){const s=this.dbPromise;this.dbPromise=null;try{(await s).close()}catch{}}}}async initializeServiceWorkerMessaging(){return Mh()?this.initializeReceiver():this.initializeSender()}async initializeReceiver(){this.receiver=$i._getInstance(Qg()),this.receiver._subscribe("keyChanged",async(e,t)=>({keyProcessed:(await this._poll()).includes(t.key)})),this.receiver._subscribe("ping",async(e,t)=>["keyChanged"])}async initializeSender(){var t,r;if(this.activeServiceWorker=await Hg(),!this.activeServiceWorker)return;this.sender=new Gg(this.activeServiceWorker);const e=await this.sender._send("ping",{},800);e&&(t=e[0])!=null&&t.fulfilled&&(r=e[0])!=null&&r.value.includes("keyChanged")&&(this.serviceWorkerReceiverAvailable=!0)}async notifyServiceWorker(e){if(!(!this.sender||!this.activeServiceWorker||Kg()!==this.activeServiceWorker))try{await this.sender._send("keyChanged",{key:e},this.serviceWorkerReceiverAvailable?800:50)}catch{}}async _isAvailable(){try{return indexedDB?(await this._withRetries(async e=>{await Hu(e,Ti,"1"),await Ku(e,Ti)}),!0):!1}catch{}return!1}async _withPendingWrite(e){this.pendingWrites++;try{await e()}finally{this.pendingWrites--}}async _set(e,t){return this._withPendingWrite(async()=>(await this._withRetries(r=>Hu(r,e,t)),this.localCache[e]=t,this.notifyServiceWorker(e)))}async _get(e){const t=await this._withRetries(r=>Xg(r,e));return this.localCache[e]=t,t}async _remove(e){return this._withPendingWrite(async()=>(await this._withRetries(t=>Ku(t,e)),delete this.localCache[e],this.notifyServiceWorker(e)))}async _poll(){if(this.isClosing)return[];try{const e=await this._withRetries(s=>{const i=ji(s,!1).getAll();return new vs(i).toPromise()});if(this.isClosing)return[];if(!e)return[];if(this.pendingWrites!==0)return[];const t=[],r=new Set;if(e.length!==0)for(const{fbase_key:s,value:i}of e)r.add(s),JSON.stringify(this.localCache[s])!==JSON.stringify(i)&&(this.notifyListeners(s,i),t.push(s));for(const s of Object.keys(this.localCache))this.localCache[s]&&!r.has(s)&&(this.notifyListeners(s,null),t.push(s));return t}catch(e){return this.isClosing||ri(`Firebase Auth cross-tab polling failed with error: ${e}`),[]}}notifyListeners(e,t){this.localCache[e]=t;const r=this.listeners[e];if(r)for(const s of Array.from(r))s(t)}startPolling(){this.stopPolling(),this.pollTimer=setInterval(async()=>this._poll(),Zg)}stopPolling(){this.pollTimer&&(clearInterval(this.pollTimer),this.pollTimer=null)}_addListener(e,t){Object.keys(this.listeners).length===0&&(this.startPolling(),this.registerLifecycleListeners()),this.listeners[e]||(this.listeners[e]=new Set,this._get(e)),this.listeners[e].add(t)}_removeListener(e,t){this.listeners[e]&&(this.listeners[e].delete(t),this.listeners[e].size===0&&delete this.listeners[e]),Object.keys(this.listeners).length===0&&(this.stopPolling(),this.unregisterLifecycleListeners())}}qh.type="LOCAL";const t_=qh;new Ts(3e4,6e4);/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function $h(n,e){return e?It(e):(z(n._popupRedirectResolver,n,"argument-error"),n._popupRedirectResolver)}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ra extends xh{constructor(e){super("custom","custom"),this.params=e}_getIdTokenResponse(e){return Hn(e,this._buildIdpRequest())}_linkToIdToken(e,t){return Hn(e,this._buildIdpRequest(t))}_getReauthenticationResolver(e){return Hn(e,this._buildIdpRequest())}_buildIdpRequest(e){const t={requestUri:this.params.requestUri,sessionId:this.params.sessionId,postBody:this.params.postBody,tenantId:this.params.tenantId,pendingToken:this.params.pendingToken,returnSecureToken:!0,returnIdpCredential:!0};return e&&(t.idToken=e),t}}function n_(n){return Ug(n.auth,new Ra(n),n.bypassAuthState)}function r_(n){const{auth:e,user:t}=n;return z(t,e,"internal-error"),Mg(t,new Ra(n),n.bypassAuthState)}async function s_(n){const{auth:e,user:t}=n;return z(t,e,"internal-error"),Lg(t,new Ra(n),n.bypassAuthState)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class jh{constructor(e,t,r,s,i=!1){this.auth=e,this.resolver=r,this.user=s,this.bypassAuthState=i,this.pendingPromise=null,this.eventManager=null,this.filter=Array.isArray(t)?t:[t]}execute(){return new Promise(async(e,t)=>{this.pendingPromise={resolve:e,reject:t};try{this.eventManager=await this.resolver._initialize(this.auth),await this.onExecution(),this.eventManager.registerConsumer(this)}catch(r){this.reject(r)}})}async onAuthEvent(e){const{urlResponse:t,sessionId:r,postBody:s,tenantId:i,error:a,type:c}=e;if(a){this.reject(a);return}const l={auth:this.auth,requestUri:t,sessionId:r,tenantId:i||void 0,postBody:s||void 0,user:this.user,bypassAuthState:this.bypassAuthState};try{this.resolve(await this.getIdpTask(c)(l))}catch(f){this.reject(f)}}onError(e){this.reject(e)}getIdpTask(e){switch(e){case"signInViaPopup":case"signInViaRedirect":return n_;case"linkViaPopup":case"linkViaRedirect":return s_;case"reauthViaPopup":case"reauthViaRedirect":return r_;default:_t(this.auth,"internal-error")}}resolve(e){St(this.pendingPromise,"Pending promise was never set"),this.pendingPromise.resolve(e),this.unregisterAndCleanUp()}reject(e){St(this.pendingPromise,"Pending promise was never set"),this.pendingPromise.reject(e),this.unregisterAndCleanUp()}unregisterAndCleanUp(){this.eventManager&&this.eventManager.unregisterConsumer(this),this.pendingPromise=null,this.cleanUp()}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const i_=new Ts(2e3,1e4);async function Y0(n,e,t){if(tt(n.app))return Promise.reject(st(n,"operation-not-supported-in-this-environment"));const r=qi(n);rg(n,e,Aa);const s=$h(r,t);return new yn(r,"signInViaPopup",e,s).executeNotNull()}class yn extends jh{constructor(e,t,r,s,i){super(e,t,s,i),this.provider=r,this.authWindow=null,this.pollId=null,yn.currentPopupAction&&yn.currentPopupAction.cancel(),yn.currentPopupAction=this}async executeNotNull(){const e=await this.execute();return z(e,this.auth,"internal-error"),e}async onExecution(){St(this.filter.length===1,"Popup operations only handle one event");const e=ba();this.authWindow=await this.resolver._openPopup(this.auth,this.provider,this.filter[0],e),this.authWindow.associatedEvent=e,this.resolver._originValidation(this.auth).catch(t=>{this.reject(t)}),this.resolver._isIframeWebStorageSupported(this.auth,t=>{t||this.reject(st(this.auth,"web-storage-unsupported"))}),this.pollUserCancellation()}get eventId(){var e;return((e=this.authWindow)==null?void 0:e.associatedEvent)||null}cancel(){this.reject(st(this.auth,"cancelled-popup-request"))}cleanUp(){this.authWindow&&this.authWindow.close(),this.pollId&&window.clearTimeout(this.pollId),this.authWindow=null,this.pollId=null,yn.currentPopupAction=null}pollUserCancellation(){const e=()=>{var t,r;if((r=(t=this.authWindow)==null?void 0:t.window)!=null&&r.closed){this.pollId=window.setTimeout(()=>{this.pollId=null,this.reject(st(this.auth,"popup-closed-by-user"))},8e3);return}this.pollId=window.setTimeout(e,i_.get())};e()}}yn.currentPopupAction=null;/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const o_="pendingRedirect",oi=new Map;class a_ extends jh{constructor(e,t,r=!1){super(e,["signInViaRedirect","linkViaRedirect","reauthViaRedirect","unknown"],t,void 0,r),this.eventId=null}async execute(){let e=oi.get(this.auth._key());if(!e){try{const r=await c_(this.resolver,this.auth)?await super.execute():null;e=()=>Promise.resolve(r)}catch(t){e=()=>Promise.reject(t)}oi.set(this.auth._key(),e)}return this.bypassAuthState||oi.set(this.auth._key(),()=>Promise.resolve(null)),e()}async onAuthEvent(e){if(e.type==="signInViaRedirect")return super.onAuthEvent(e);if(e.type==="unknown"){this.resolve(null);return}if(e.eventId){const t=await this.auth._redirectUserForId(e.eventId);if(t)return this.user=t,super.onAuthEvent(e);this.resolve(null)}}async onExecution(){}cleanUp(){}}async function c_(n,e){const t=h_(e),r=l_(n);if(!await r._isAvailable())return!1;const s=await r._get(t)==="true";return await r._remove(t),s}function u_(n,e){oi.set(n._key(),e)}function l_(n){return It(n._redirectPersistence)}function h_(n){return ii(o_,n.config.apiKey,n.name)}async function f_(n,e,t=!1){if(tt(n.app))return Promise.reject(wn(n));const r=qi(n),s=$h(r,e),a=await new a_(r,s,t).execute();return a&&!t&&(delete a.user._redirectEventId,await r._persistUserIfCurrent(a.user),await r._setRedirectUser(null,e)),a}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const d_=600*1e3;class p_{constructor(e){this.auth=e,this.cachedEventUids=new Set,this.consumers=new Set,this.queuedRedirectEvent=null,this.hasHandledPotentialRedirect=!1,this.lastProcessedEventTime=Date.now()}registerConsumer(e){this.consumers.add(e),this.queuedRedirectEvent&&this.isEventForConsumer(this.queuedRedirectEvent,e)&&(this.sendToConsumer(this.queuedRedirectEvent,e),this.saveEventToCache(this.queuedRedirectEvent),this.queuedRedirectEvent=null)}unregisterConsumer(e){this.consumers.delete(e)}onEvent(e){if(this.hasEventBeenHandled(e))return!1;let t=!1;return this.consumers.forEach(r=>{this.isEventForConsumer(e,r)&&(t=!0,this.sendToConsumer(e,r),this.saveEventToCache(e))}),this.hasHandledPotentialRedirect||!m_(e)||(this.hasHandledPotentialRedirect=!0,t||(this.queuedRedirectEvent=e,t=!0)),t}sendToConsumer(e,t){var r;if(e.error&&!zh(e)){const s=((r=e.error.code)==null?void 0:r.split("auth/")[1])||"internal-error";t.onError(st(this.auth,s))}else t.onAuthEvent(e)}isEventForConsumer(e,t){const r=t.eventId===null||!!e.eventId&&e.eventId===t.eventId;return t.filter.includes(e.type)&&r}hasEventBeenHandled(e){return Date.now()-this.lastProcessedEventTime>=d_&&this.cachedEventUids.clear(),this.cachedEventUids.has(Qu(e))}saveEventToCache(e){this.cachedEventUids.add(Qu(e)),this.lastProcessedEventTime=Date.now()}}function Qu(n){return[n.type,n.eventId,n.sessionId,n.tenantId].filter(e=>e).join("-")}function zh({type:n,error:e}){return n==="unknown"&&(e==null?void 0:e.code)==="auth/no-auth-event"}function m_(n){switch(n.type){case"signInViaRedirect":case"linkViaRedirect":case"reauthViaRedirect":return!0;case"unknown":return zh(n);default:return!1}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function g_(n,e={}){return ur(n,"GET","/v1/projects",e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const __=/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/,y_=/^https?/;async function E_(n){if(n.config.emulator)return;const{authorizedDomains:e}=await g_(n);for(const t of e)try{if(w_(t))return}catch{}_t(n,"unauthorized-domain")}function w_(n){const e=Ho(),{protocol:t,hostname:r}=new URL(e);if(n.startsWith("chrome-extension://")){const a=new URL(n);return a.hostname===""&&r===""?t==="chrome-extension:"&&n.replace("chrome-extension://","")===e.replace("chrome-extension://",""):t==="chrome-extension:"&&a.hostname===r}if(!y_.test(t))return!1;if(__.test(n))return r===n;const s=n.replace(/\./g,"\\.");return new RegExp("^(.+\\."+s+"|"+s+")$","i").test(r)}/**
 * @license
 * Copyright 2020 Google LLC.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const T_=new Ts(3e4,6e4);function Yu(){const n=ft().___jsl;if(n!=null&&n.H){for(const e of Object.keys(n.H))if(n.H[e].r=n.H[e].r||[],n.H[e].L=n.H[e].L||[],n.H[e].r=[...n.H[e].L],n.CP)for(let t=0;t<n.CP.length;t++)n.CP[t]=null}}function I_(n){return new Promise((e,t)=>{var s,i,a;function r(){Yu(),gapi.load("gapi.iframes",{callback:()=>{e(gapi.iframes.getContext())},ontimeout:()=>{Yu(),t(st(n,"network-request-failed"))},timeout:T_.get()})}if((i=(s=ft().gapi)==null?void 0:s.iframes)!=null&&i.Iframe)e(gapi.iframes.getContext());else if((a=ft().gapi)!=null&&a.load)r();else{const c=Sg("iframefcb");return ft()[c]=()=>{gapi.load?r():t(st(n,"network-request-failed"))},Pg(`${Vg()}?onload=${c}`).catch(l=>t(l))}}).catch(e=>{throw ai=null,e})}let ai=null;function v_(n){return ai=ai||I_(n),ai}/**
 * @license
 * Copyright 2020 Google LLC.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const A_=new Ts(5e3,15e3),b_="__/auth/iframe",R_="emulator/auth/iframe",P_={style:{position:"absolute",top:"-100px",width:"1px",height:"1px"},"aria-hidden":"true",tabindex:"-1"},V_=new Map([["identitytoolkit.googleapis.com","p"],["staging-identitytoolkit.sandbox.googleapis.com","s"],["test-identitytoolkit.sandbox.googleapis.com","t"]]);function S_(n){const e=n.config;z(e.authDomain,n,"auth-domain-config-required");const t=e.emulator?Ea(e,R_):`https://${n.config.authDomain}/${b_}`,r={apiKey:e.apiKey,appName:n.name,v:cr},s=V_.get(n.config.apiHost);s&&(r.eid=s);const i=n._getFrameworks();return i.length&&(r.fw=i.join(",")),`${t}?${Es(r).slice(1)}`}async function C_(n){const e=await v_(n),t=ft().gapi;return z(t,n,"internal-error"),e.open({where:document.body,url:S_(n),messageHandlersFilter:t.iframes.CROSS_ORIGIN_IFRAMES_FILTER,attributes:P_,dontclear:!0},r=>new Promise(async(s,i)=>{await r.restyle({setHideOnLeave:!1});const a=st(n,"network-request-failed"),c=ft().setTimeout(()=>{i(a)},A_.get());function l(){ft().clearTimeout(c),s(r)}r.ping(l).then(l,()=>{i(a)})}))}/**
 * @license
 * Copyright 2020 Google LLC.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const x_={location:"yes",resizable:"yes",statusbar:"yes",toolbar:"no"},N_=500,k_=600,D_="_blank",O_="http://localhost";class Ju{constructor(e){this.window=e,this.associatedEvent=null}close(){if(this.window)try{this.window.close()}catch{}}}function L_(n,e,t,r=N_,s=k_){const i=Math.max((window.screen.availHeight-s)/2,0).toString(),a=Math.max((window.screen.availWidth-r)/2,0).toString();let c="";const l={...x_,width:r.toString(),height:s.toString(),top:i,left:a},f=Ne().toLowerCase();t&&(c=vh(f)?D_:t),Th(f)&&(e=e||O_,l.scrollbars="yes");const d=Object.entries(l).reduce((I,[V,x])=>`${I}${V}=${x},`,"");if(Eg(f)&&c!=="_self")return M_(e||"",c),new Ju(null);const m=window.open(e||"",c,d);z(m,n,"popup-blocked");try{m.focus()}catch{}return new Ju(m)}function M_(n,e){const t=document.createElement("a");t.href=n,t.target=e;const r=document.createEvent("MouseEvent");r.initMouseEvent("click",!0,!0,window,1,0,0,0,0,!1,!1,!1,!1,1,null),t.dispatchEvent(r)}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const U_="__/auth/handler",F_="emulator/auth/handler",B_=encodeURIComponent("fac");async function Xu(n,e,t,r,s,i){z(n.config.authDomain,n,"auth-domain-config-required"),z(n.config.apiKey,n,"invalid-api-key");const a={apiKey:n.config.apiKey,appName:n.name,authType:t,redirectUrl:r,v:cr,eventId:s};if(e instanceof Aa){e.setDefaultLanguage(n.languageCode),a.providerId=e.providerId||"",Xp(e.getCustomParameters())||(a.customParameters=JSON.stringify(e.getCustomParameters()));for(const[d,m]of Object.entries({}))a[d]=m}if(e instanceof Is){const d=e.getScopes().filter(m=>m!=="");d.length>0&&(a.scopes=d.join(","))}n.tenantId&&(a.tid=n.tenantId);const c=a;for(const d of Object.keys(c))c[d]===void 0&&delete c[d];const l=await n._getAppCheckToken(),f=l?`#${B_}=${encodeURIComponent(l)}`:"";return`${q_(n)}?${Es(c).slice(1)}${f}`}function q_({config:n}){return n.emulator?Ea(n,F_):`https://${n.authDomain}/${U_}`}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Lo="webStorageSupport";class $_{constructor(){this.eventManagers={},this.iframes={},this.originValidationPromises={},this._redirectPersistence=Lh,this._completeRedirectFn=f_,this._overrideRedirectResult=u_}async _openPopup(e,t,r,s){var a;St((a=this.eventManagers[e._key()])==null?void 0:a.manager,"_initialize() not called before _openPopup()");const i=await Xu(e,t,r,Ho(),s);return L_(e,i,ba())}async _openRedirect(e,t,r,s){await this._originValidation(e);const i=await Xu(e,t,r,Ho(),s);return Wg(i),new Promise(()=>{})}_initialize(e){const t=e._key();if(this.eventManagers[t]){const{manager:s,promise:i}=this.eventManagers[t];return s?Promise.resolve(s):(St(i,"If manager is not set, promise should be"),i)}const r=this.initAndGetManager(e);return this.eventManagers[t]={promise:r},r.catch(()=>{delete this.eventManagers[t]}),r}async initAndGetManager(e){const t=await C_(e),r=new p_(e);return t.register("authEvent",s=>(z(s==null?void 0:s.authEvent,e,"invalid-auth-event"),{status:r.onEvent(s.authEvent)?"ACK":"ERROR"}),gapi.iframes.CROSS_ORIGIN_IFRAMES_FILTER),this.eventManagers[e._key()]={manager:r},this.iframes[e._key()]=t,r}_isIframeWebStorageSupported(e,t){this.iframes[e._key()].send(Lo,{type:Lo},s=>{var a;const i=(a=s==null?void 0:s[0])==null?void 0:a[Lo];i!==void 0&&t(!!i),_t(e,"internal-error")},gapi.iframes.CROSS_ORIGIN_IFRAMES_FILTER)}_originValidation(e){const t=e._key();return this.originValidationPromises[t]||(this.originValidationPromises[t]=E_(e)),this.originValidationPromises[t]}get _shouldInitProactively(){return Vh()||Ih()||Ia()}}const j_=$_;var Zu="@firebase/auth",el="1.13.8";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class z_{constructor(e){this.auth=e,this.internalListeners=new Map}getUid(){var e;return this.assertAuthConfigured(),((e=this.auth.currentUser)==null?void 0:e.uid)||null}async getToken(e){return this.assertAuthConfigured(),await this.auth._initializationPromise,this.auth.currentUser?{accessToken:await this.auth.currentUser.getIdToken(e)}:null}addAuthTokenListener(e){if(this.assertAuthConfigured(),this.internalListeners.has(e))return;const t=this.auth.onIdTokenChanged(r=>{e((r==null?void 0:r.stsTokenManager.accessToken)||null)});this.internalListeners.set(e,t),this.updateProactiveRefresh()}removeAuthTokenListener(e){this.assertAuthConfigured();const t=this.internalListeners.get(e);t&&(this.internalListeners.delete(e),t(),this.updateProactiveRefresh())}assertAuthConfigured(){z(this.auth._initializationPromise,"dependent-sdk-initialized-before-auth")}updateProactiveRefresh(){this.internalListeners.size>0?this.auth._startProactiveRefresh():this.auth._stopProactiveRefresh()}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function G_(n){switch(n){case"Node":return"node";case"ReactNative":return"rn";case"Worker":return"webworker";case"Cordova":return"cordova";case"WebExtension":return"web-extension";default:return}}function W_(n){Jn(new Rn("auth",(e,{options:t})=>{const r=e.getProvider("app").getImmediate(),s=e.getProvider("heartbeat"),i=e.getProvider("app-check-internal"),{apiKey:a,authDomain:c}=r.options;z(a&&!a.includes(":"),"invalid-api-key",{appName:r.name});const l={apiKey:a,authDomain:c,clientPlatform:n,apiHost:"identitytoolkit.googleapis.com",tokenApiHost:"securetoken.googleapis.com",apiScheme:"https",sdkClientVersion:Sh(n)},f=new bg(r,s,i,l);return xg(f,t),f},"PUBLIC").setInstantiationMode("EXPLICIT").setInstanceCreatedCallback((e,t,r)=>{e.getProvider("auth-internal").initialize()})),Jn(new Rn("auth-internal",e=>{const t=qi(e.getProvider("auth").getImmediate());return(r=>new z_(r))(t)},"PRIVATE").setInstantiationMode("EXPLICIT")),Ht(Zu,el,G_(n)),Ht(Zu,el,"esm2020")}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const H_=300,K_=ch("authIdTokenMaxAge")||H_;let tl=null;const Q_=n=>async e=>{const t=e&&await e.getIdTokenResult(),r=t&&(new Date().getTime()-Date.parse(t.issuedAtTime))/1e3;if(r&&r>K_)return;const s=t==null?void 0:t.token;tl!==s&&(tl=s,await fetch(n,{method:s?"POST":"DELETE",headers:s?{Authorization:`Bearer ${s}`}:{}}))};function J0(n=lh()){const e=_a(n,"auth");if(e.isInitialized())return e.getImmediate();const t=Cg(n,{popupRedirectResolver:j_,persistence:[t_,jg,Lh]}),r=ch("authTokenSyncURL");if(r&&typeof isSecureContext=="boolean"&&isSecureContext){const i=new URL(r,location.origin);if(location.origin===i.origin){const a=Q_(i.toString());Bg(t,a,()=>a(t.currentUser)),Fg(t,c=>a(c))}}const s=oh("auth");return s&&Ng(t,`http://${s}`),t}function Y_(){var n;return((n=document.getElementsByTagName("head"))==null?void 0:n[0])??document}Rg({loadJS(n){return new Promise((e,t)=>{const r=document.createElement("script");r.setAttribute("src",n),r.onload=e,r.onerror=s=>{const i=st("internal-error");i.customData=s,t(i)},r.type="text/javascript",r.charset="UTF-8",Y_().appendChild(r)})},gapiScript:"https://apis.google.com/js/api.js",recaptchaV2Script:"https://www.google.com/recaptcha/api.js",recaptchaEnterpriseScript:"https://www.google.com/recaptcha/enterprise.js?render="});W_("Browser");var nl=typeof globalThis<"u"?globalThis:typeof window<"u"?window:typeof global<"u"?global:typeof self<"u"?self:{};/** @license
Copyright The Closure Library Authors.
SPDX-License-Identifier: Apache-2.0
*/var Kt,Gh;(function(){var n;/** @license

 Copyright The Closure Library Authors.
 SPDX-License-Identifier: Apache-2.0
*/function e(T,g){function y(){}y.prototype=g.prototype,T.F=g.prototype,T.prototype=new y,T.prototype.constructor=T,T.D=function(v,w,b){for(var _=Array(arguments.length-2),Me=2;Me<arguments.length;Me++)_[Me-2]=arguments[Me];return g.prototype[w].apply(v,_)}}function t(){this.blockSize=-1}function r(){this.blockSize=-1,this.blockSize=64,this.g=Array(4),this.C=Array(this.blockSize),this.o=this.h=0,this.u()}e(r,t),r.prototype.u=function(){this.g[0]=1732584193,this.g[1]=4023233417,this.g[2]=2562383102,this.g[3]=271733878,this.o=this.h=0};function s(T,g,y){y||(y=0);const v=Array(16);if(typeof g=="string")for(var w=0;w<16;++w)v[w]=g.charCodeAt(y++)|g.charCodeAt(y++)<<8|g.charCodeAt(y++)<<16|g.charCodeAt(y++)<<24;else for(w=0;w<16;++w)v[w]=g[y++]|g[y++]<<8|g[y++]<<16|g[y++]<<24;g=T.g[0],y=T.g[1],w=T.g[2];let b=T.g[3],_;_=g+(b^y&(w^b))+v[0]+3614090360&4294967295,g=y+(_<<7&4294967295|_>>>25),_=b+(w^g&(y^w))+v[1]+3905402710&4294967295,b=g+(_<<12&4294967295|_>>>20),_=w+(y^b&(g^y))+v[2]+606105819&4294967295,w=b+(_<<17&4294967295|_>>>15),_=y+(g^w&(b^g))+v[3]+3250441966&4294967295,y=w+(_<<22&4294967295|_>>>10),_=g+(b^y&(w^b))+v[4]+4118548399&4294967295,g=y+(_<<7&4294967295|_>>>25),_=b+(w^g&(y^w))+v[5]+1200080426&4294967295,b=g+(_<<12&4294967295|_>>>20),_=w+(y^b&(g^y))+v[6]+2821735955&4294967295,w=b+(_<<17&4294967295|_>>>15),_=y+(g^w&(b^g))+v[7]+4249261313&4294967295,y=w+(_<<22&4294967295|_>>>10),_=g+(b^y&(w^b))+v[8]+1770035416&4294967295,g=y+(_<<7&4294967295|_>>>25),_=b+(w^g&(y^w))+v[9]+2336552879&4294967295,b=g+(_<<12&4294967295|_>>>20),_=w+(y^b&(g^y))+v[10]+4294925233&4294967295,w=b+(_<<17&4294967295|_>>>15),_=y+(g^w&(b^g))+v[11]+2304563134&4294967295,y=w+(_<<22&4294967295|_>>>10),_=g+(b^y&(w^b))+v[12]+1804603682&4294967295,g=y+(_<<7&4294967295|_>>>25),_=b+(w^g&(y^w))+v[13]+4254626195&4294967295,b=g+(_<<12&4294967295|_>>>20),_=w+(y^b&(g^y))+v[14]+2792965006&4294967295,w=b+(_<<17&4294967295|_>>>15),_=y+(g^w&(b^g))+v[15]+1236535329&4294967295,y=w+(_<<22&4294967295|_>>>10),_=g+(w^b&(y^w))+v[1]+4129170786&4294967295,g=y+(_<<5&4294967295|_>>>27),_=b+(y^w&(g^y))+v[6]+3225465664&4294967295,b=g+(_<<9&4294967295|_>>>23),_=w+(g^y&(b^g))+v[11]+643717713&4294967295,w=b+(_<<14&4294967295|_>>>18),_=y+(b^g&(w^b))+v[0]+3921069994&4294967295,y=w+(_<<20&4294967295|_>>>12),_=g+(w^b&(y^w))+v[5]+3593408605&4294967295,g=y+(_<<5&4294967295|_>>>27),_=b+(y^w&(g^y))+v[10]+38016083&4294967295,b=g+(_<<9&4294967295|_>>>23),_=w+(g^y&(b^g))+v[15]+3634488961&4294967295,w=b+(_<<14&4294967295|_>>>18),_=y+(b^g&(w^b))+v[4]+3889429448&4294967295,y=w+(_<<20&4294967295|_>>>12),_=g+(w^b&(y^w))+v[9]+568446438&4294967295,g=y+(_<<5&4294967295|_>>>27),_=b+(y^w&(g^y))+v[14]+3275163606&4294967295,b=g+(_<<9&4294967295|_>>>23),_=w+(g^y&(b^g))+v[3]+4107603335&4294967295,w=b+(_<<14&4294967295|_>>>18),_=y+(b^g&(w^b))+v[8]+1163531501&4294967295,y=w+(_<<20&4294967295|_>>>12),_=g+(w^b&(y^w))+v[13]+2850285829&4294967295,g=y+(_<<5&4294967295|_>>>27),_=b+(y^w&(g^y))+v[2]+4243563512&4294967295,b=g+(_<<9&4294967295|_>>>23),_=w+(g^y&(b^g))+v[7]+1735328473&4294967295,w=b+(_<<14&4294967295|_>>>18),_=y+(b^g&(w^b))+v[12]+2368359562&4294967295,y=w+(_<<20&4294967295|_>>>12),_=g+(y^w^b)+v[5]+4294588738&4294967295,g=y+(_<<4&4294967295|_>>>28),_=b+(g^y^w)+v[8]+2272392833&4294967295,b=g+(_<<11&4294967295|_>>>21),_=w+(b^g^y)+v[11]+1839030562&4294967295,w=b+(_<<16&4294967295|_>>>16),_=y+(w^b^g)+v[14]+4259657740&4294967295,y=w+(_<<23&4294967295|_>>>9),_=g+(y^w^b)+v[1]+2763975236&4294967295,g=y+(_<<4&4294967295|_>>>28),_=b+(g^y^w)+v[4]+1272893353&4294967295,b=g+(_<<11&4294967295|_>>>21),_=w+(b^g^y)+v[7]+4139469664&4294967295,w=b+(_<<16&4294967295|_>>>16),_=y+(w^b^g)+v[10]+3200236656&4294967295,y=w+(_<<23&4294967295|_>>>9),_=g+(y^w^b)+v[13]+681279174&4294967295,g=y+(_<<4&4294967295|_>>>28),_=b+(g^y^w)+v[0]+3936430074&4294967295,b=g+(_<<11&4294967295|_>>>21),_=w+(b^g^y)+v[3]+3572445317&4294967295,w=b+(_<<16&4294967295|_>>>16),_=y+(w^b^g)+v[6]+76029189&4294967295,y=w+(_<<23&4294967295|_>>>9),_=g+(y^w^b)+v[9]+3654602809&4294967295,g=y+(_<<4&4294967295|_>>>28),_=b+(g^y^w)+v[12]+3873151461&4294967295,b=g+(_<<11&4294967295|_>>>21),_=w+(b^g^y)+v[15]+530742520&4294967295,w=b+(_<<16&4294967295|_>>>16),_=y+(w^b^g)+v[2]+3299628645&4294967295,y=w+(_<<23&4294967295|_>>>9),_=g+(w^(y|~b))+v[0]+4096336452&4294967295,g=y+(_<<6&4294967295|_>>>26),_=b+(y^(g|~w))+v[7]+1126891415&4294967295,b=g+(_<<10&4294967295|_>>>22),_=w+(g^(b|~y))+v[14]+2878612391&4294967295,w=b+(_<<15&4294967295|_>>>17),_=y+(b^(w|~g))+v[5]+4237533241&4294967295,y=w+(_<<21&4294967295|_>>>11),_=g+(w^(y|~b))+v[12]+1700485571&4294967295,g=y+(_<<6&4294967295|_>>>26),_=b+(y^(g|~w))+v[3]+2399980690&4294967295,b=g+(_<<10&4294967295|_>>>22),_=w+(g^(b|~y))+v[10]+4293915773&4294967295,w=b+(_<<15&4294967295|_>>>17),_=y+(b^(w|~g))+v[1]+2240044497&4294967295,y=w+(_<<21&4294967295|_>>>11),_=g+(w^(y|~b))+v[8]+1873313359&4294967295,g=y+(_<<6&4294967295|_>>>26),_=b+(y^(g|~w))+v[15]+4264355552&4294967295,b=g+(_<<10&4294967295|_>>>22),_=w+(g^(b|~y))+v[6]+2734768916&4294967295,w=b+(_<<15&4294967295|_>>>17),_=y+(b^(w|~g))+v[13]+1309151649&4294967295,y=w+(_<<21&4294967295|_>>>11),_=g+(w^(y|~b))+v[4]+4149444226&4294967295,g=y+(_<<6&4294967295|_>>>26),_=b+(y^(g|~w))+v[11]+3174756917&4294967295,b=g+(_<<10&4294967295|_>>>22),_=w+(g^(b|~y))+v[2]+718787259&4294967295,w=b+(_<<15&4294967295|_>>>17),_=y+(b^(w|~g))+v[9]+3951481745&4294967295,T.g[0]=T.g[0]+g&4294967295,T.g[1]=T.g[1]+(w+(_<<21&4294967295|_>>>11))&4294967295,T.g[2]=T.g[2]+w&4294967295,T.g[3]=T.g[3]+b&4294967295}r.prototype.v=function(T,g){g===void 0&&(g=T.length);const y=g-this.blockSize,v=this.C;let w=this.h,b=0;for(;b<g;){if(w==0)for(;b<=y;)s(this,T,b),b+=this.blockSize;if(typeof T=="string"){for(;b<g;)if(v[w++]=T.charCodeAt(b++),w==this.blockSize){s(this,v),w=0;break}}else for(;b<g;)if(v[w++]=T[b++],w==this.blockSize){s(this,v),w=0;break}}this.h=w,this.o+=g},r.prototype.A=function(){var T=Array((this.h<56?this.blockSize:this.blockSize*2)-this.h);T[0]=128;for(var g=1;g<T.length-8;++g)T[g]=0;g=this.o*8;for(var y=T.length-8;y<T.length;++y)T[y]=g&255,g/=256;for(this.v(T),T=Array(16),g=0,y=0;y<4;++y)for(let v=0;v<32;v+=8)T[g++]=this.g[y]>>>v&255;return T};function i(T,g){var y=c;return Object.prototype.hasOwnProperty.call(y,T)?y[T]:y[T]=g(T)}function a(T,g){this.h=g;const y=[];let v=!0;for(let w=T.length-1;w>=0;w--){const b=T[w]|0;v&&b==g||(y[w]=b,v=!1)}this.g=y}var c={};function l(T){return-128<=T&&T<128?i(T,function(g){return new a([g|0],g<0?-1:0)}):new a([T|0],T<0?-1:0)}function f(T){if(isNaN(T)||!isFinite(T))return m;if(T<0)return O(f(-T));const g=[];let y=1;for(let v=0;T>=y;v++)g[v]=T/y|0,y*=4294967296;return new a(g,0)}function d(T,g){if(T.length==0)throw Error("number format error: empty string");if(g=g||10,g<2||36<g)throw Error("radix out of range: "+g);if(T.charAt(0)=="-")return O(d(T.substring(1),g));if(T.indexOf("-")>=0)throw Error('number format error: interior "-" character');const y=f(Math.pow(g,8));let v=m;for(let b=0;b<T.length;b+=8){var w=Math.min(8,T.length-b);const _=parseInt(T.substring(b,b+w),g);w<8?(w=f(Math.pow(g,w)),v=v.j(w).add(f(_))):(v=v.j(y),v=v.add(f(_)))}return v}var m=l(0),I=l(1),V=l(16777216);n=a.prototype,n.m=function(){if(M(this))return-O(this).m();let T=0,g=1;for(let y=0;y<this.g.length;y++){const v=this.i(y);T+=(v>=0?v:4294967296+v)*g,g*=4294967296}return T},n.toString=function(T){if(T=T||10,T<2||36<T)throw Error("radix out of range: "+T);if(x(this))return"0";if(M(this))return"-"+O(this).toString(T);const g=f(Math.pow(T,6));var y=this;let v="";for(;;){const w=De(y,g).g;y=W(y,w.j(g));let b=((y.g.length>0?y.g[0]:y.h)>>>0).toString(T);if(y=w,x(y))return b+v;for(;b.length<6;)b="0"+b;v=b+v}},n.i=function(T){return T<0?0:T<this.g.length?this.g[T]:this.h};function x(T){if(T.h!=0)return!1;for(let g=0;g<T.g.length;g++)if(T.g[g]!=0)return!1;return!0}function M(T){return T.h==-1}n.l=function(T){return T=W(this,T),M(T)?-1:x(T)?0:1};function O(T){const g=T.g.length,y=[];for(let v=0;v<g;v++)y[v]=~T.g[v];return new a(y,~T.h).add(I)}n.abs=function(){return M(this)?O(this):this},n.add=function(T){const g=Math.max(this.g.length,T.g.length),y=[];let v=0;for(let w=0;w<=g;w++){let b=v+(this.i(w)&65535)+(T.i(w)&65535),_=(b>>>16)+(this.i(w)>>>16)+(T.i(w)>>>16);v=_>>>16,b&=65535,_&=65535,y[w]=_<<16|b}return new a(y,y[y.length-1]&-2147483648?-1:0)};function W(T,g){return T.add(O(g))}n.j=function(T){if(x(this)||x(T))return m;if(M(this))return M(T)?O(this).j(O(T)):O(O(this).j(T));if(M(T))return O(this.j(O(T)));if(this.l(V)<0&&T.l(V)<0)return f(this.m()*T.m());const g=this.g.length+T.g.length,y=[];for(var v=0;v<2*g;v++)y[v]=0;for(v=0;v<this.g.length;v++)for(let w=0;w<T.g.length;w++){const b=this.i(v)>>>16,_=this.i(v)&65535,Me=T.i(w)>>>16,ln=T.i(w)&65535;y[2*v+2*w]+=_*ln,J(y,2*v+2*w),y[2*v+2*w+1]+=b*ln,J(y,2*v+2*w+1),y[2*v+2*w+1]+=_*Me,J(y,2*v+2*w+1),y[2*v+2*w+2]+=b*Me,J(y,2*v+2*w+2)}for(T=0;T<g;T++)y[T]=y[2*T+1]<<16|y[2*T];for(T=g;T<2*g;T++)y[T]=0;return new a(y,0)};function J(T,g){for(;(T[g]&65535)!=T[g];)T[g+1]+=T[g]>>>16,T[g]&=65535,g++}function se(T,g){this.g=T,this.h=g}function De(T,g){if(x(g))throw Error("division by zero");if(x(T))return new se(m,m);if(M(T))return g=De(O(T),g),new se(O(g.g),O(g.h));if(M(g))return g=De(T,O(g)),new se(O(g.g),g.h);if(T.g.length>30){if(M(T)||M(g))throw Error("slowDivide_ only works with positive integers.");for(var y=I,v=g;v.l(T)<=0;)y=ge(y),v=ge(v);var w=_e(y,1),b=_e(v,1);for(v=_e(v,2),y=_e(y,2);!x(v);){var _=b.add(v);_.l(T)<=0&&(w=w.add(y),b=_),v=_e(v,1),y=_e(y,1)}return g=W(T,w.j(g)),new se(w,g)}for(w=m;T.l(g)>=0;){for(y=Math.max(1,Math.floor(T.m()/g.m())),v=Math.ceil(Math.log(y)/Math.LN2),v=v<=48?1:Math.pow(2,v-48),b=f(y),_=b.j(g);M(_)||_.l(T)>0;)y-=v,b=f(y),_=b.j(g);x(b)&&(b=I),w=w.add(b),T=W(T,_)}return new se(w,T)}n.B=function(T){return De(this,T).h},n.and=function(T){const g=Math.max(this.g.length,T.g.length),y=[];for(let v=0;v<g;v++)y[v]=this.i(v)&T.i(v);return new a(y,this.h&T.h)},n.or=function(T){const g=Math.max(this.g.length,T.g.length),y=[];for(let v=0;v<g;v++)y[v]=this.i(v)|T.i(v);return new a(y,this.h|T.h)},n.xor=function(T){const g=Math.max(this.g.length,T.g.length),y=[];for(let v=0;v<g;v++)y[v]=this.i(v)^T.i(v);return new a(y,this.h^T.h)};function ge(T){const g=T.g.length+1,y=[];for(let v=0;v<g;v++)y[v]=T.i(v)<<1|T.i(v-1)>>>31;return new a(y,T.h)}function _e(T,g){const y=g>>5;g%=32;const v=T.g.length-y,w=[];for(let b=0;b<v;b++)w[b]=g>0?T.i(b+y)>>>g|T.i(b+y+1)<<32-g:T.i(b+y);return new a(w,T.h)}r.prototype.digest=r.prototype.A,r.prototype.reset=r.prototype.u,r.prototype.update=r.prototype.v,Gh=r,a.prototype.add=a.prototype.add,a.prototype.multiply=a.prototype.j,a.prototype.modulo=a.prototype.B,a.prototype.compare=a.prototype.l,a.prototype.toNumber=a.prototype.m,a.prototype.toString=a.prototype.toString,a.prototype.getBits=a.prototype.i,a.fromNumber=f,a.fromString=d,Kt=a}).apply(typeof nl<"u"?nl:typeof self<"u"?self:typeof window<"u"?window:{});var Js=typeof globalThis<"u"?globalThis:typeof window<"u"?window:typeof global<"u"?global:typeof self<"u"?self:{};/** @license
Copyright The Closure Library Authors.
SPDX-License-Identifier: Apache-2.0
*/var Wh,Lr,Hh,ci,Qo,Kh,Qh,Yh;(function(){var n,e=Object.defineProperty;function t(o){o=[typeof globalThis=="object"&&globalThis,o,typeof window=="object"&&window,typeof self=="object"&&self,typeof Js=="object"&&Js];for(var u=0;u<o.length;++u){var h=o[u];if(h&&h.Math==Math)return h}throw Error("Cannot find global object")}var r=t(this);function s(o,u){if(u)e:{var h=r;o=o.split(".");for(var p=0;p<o.length-1;p++){var A=o[p];if(!(A in h))break e;h=h[A]}o=o[o.length-1],p=h[o],u=u(p),u!=p&&u!=null&&e(h,o,{configurable:!0,writable:!0,value:u})}}s("Symbol.dispose",function(o){return o||Symbol("Symbol.dispose")}),s("Array.prototype.values",function(o){return o||function(){return this[Symbol.iterator]()}}),s("Object.entries",function(o){return o||function(u){var h=[],p;for(p in u)Object.prototype.hasOwnProperty.call(u,p)&&h.push([p,u[p]]);return h}});/** @license

 Copyright The Closure Library Authors.
 SPDX-License-Identifier: Apache-2.0
*/var i=i||{},a=this||self;function c(o){var u=typeof o;return u=="object"&&o!=null||u=="function"}function l(o,u,h){return o.call.apply(o.bind,arguments)}function f(o,u,h){return f=l,f.apply(null,arguments)}function d(o,u){var h=Array.prototype.slice.call(arguments,1);return function(){var p=h.slice();return p.push.apply(p,arguments),o.apply(this,p)}}function m(o,u){function h(){}h.prototype=u.prototype,o.Z=u.prototype,o.prototype=new h,o.prototype.constructor=o,o.Ob=function(p,A,R){for(var k=Array(arguments.length-2),K=2;K<arguments.length;K++)k[K-2]=arguments[K];return u.prototype[A].apply(p,k)}}var I=typeof AsyncContext<"u"&&typeof AsyncContext.Snapshot=="function"?o=>o&&AsyncContext.Snapshot.wrap(o):o=>o;function V(o){const u=o.length;if(u>0){const h=Array(u);for(let p=0;p<u;p++)h[p]=o[p];return h}return[]}function x(o,u){for(let p=1;p<arguments.length;p++){const A=arguments[p];var h=typeof A;if(h=h!="object"?h:A?Array.isArray(A)?"array":h:"null",h=="array"||h=="object"&&typeof A.length=="number"){h=o.length||0;const R=A.length||0;o.length=h+R;for(let k=0;k<R;k++)o[h+k]=A[k]}else o.push(A)}}class M{constructor(u,h){this.i=u,this.j=h,this.h=0,this.g=null}get(){let u;return this.h>0?(this.h--,u=this.g,this.g=u.next,u.next=null):u=this.i(),u}}function O(o){a.setTimeout(()=>{throw o},0)}function W(){var o=T;let u=null;return o.g&&(u=o.g,o.g=o.g.next,o.g||(o.h=null),u.next=null),u}class J{constructor(){this.h=this.g=null}add(u,h){const p=se.get();p.set(u,h),this.h?this.h.next=p:this.g=p,this.h=p}}var se=new M(()=>new De,o=>o.reset());class De{constructor(){this.next=this.g=this.h=null}set(u,h){this.h=u,this.g=h,this.next=null}reset(){this.next=this.g=this.h=null}}let ge,_e=!1,T=new J,g=()=>{const o=Promise.resolve(void 0);ge=()=>{o.then(y)}};function y(){for(var o;o=W();){try{o.h.call(o.g)}catch(h){O(h)}var u=se;u.j(o),u.h<100&&(u.h++,o.next=u.g,u.g=o)}_e=!1}function v(){this.u=this.u,this.C=this.C}v.prototype.u=!1,v.prototype.dispose=function(){this.u||(this.u=!0,this.N())},v.prototype[Symbol.dispose]=function(){this.dispose()},v.prototype.N=function(){if(this.C)for(;this.C.length;)this.C.shift()()};function w(o,u){this.type=o,this.g=this.target=u,this.defaultPrevented=!1}w.prototype.h=function(){this.defaultPrevented=!0};var b=(function(){if(!a.addEventListener||!Object.defineProperty)return!1;var o=!1,u=Object.defineProperty({},"passive",{get:function(){o=!0}});try{const h=()=>{};a.addEventListener("test",h,u),a.removeEventListener("test",h,u)}catch{}return o})();function _(o){return/^[\s\xa0]*$/.test(o)}function Me(o,u){w.call(this,o?o.type:""),this.relatedTarget=this.g=this.target=null,this.button=this.screenY=this.screenX=this.clientY=this.clientX=0,this.key="",this.metaKey=this.shiftKey=this.altKey=this.ctrlKey=!1,this.state=null,this.pointerId=0,this.pointerType="",this.i=null,o&&this.init(o,u)}m(Me,w),Me.prototype.init=function(o,u){const h=this.type=o.type,p=o.changedTouches&&o.changedTouches.length?o.changedTouches[0]:null;this.target=o.target||o.srcElement,this.g=u,u=o.relatedTarget,u||(h=="mouseover"?u=o.fromElement:h=="mouseout"&&(u=o.toElement)),this.relatedTarget=u,p?(this.clientX=p.clientX!==void 0?p.clientX:p.pageX,this.clientY=p.clientY!==void 0?p.clientY:p.pageY,this.screenX=p.screenX||0,this.screenY=p.screenY||0):(this.clientX=o.clientX!==void 0?o.clientX:o.pageX,this.clientY=o.clientY!==void 0?o.clientY:o.pageY,this.screenX=o.screenX||0,this.screenY=o.screenY||0),this.button=o.button,this.key=o.key||"",this.ctrlKey=o.ctrlKey,this.altKey=o.altKey,this.shiftKey=o.shiftKey,this.metaKey=o.metaKey,this.pointerId=o.pointerId||0,this.pointerType=o.pointerType,this.state=o.state,this.i=o,o.defaultPrevented&&Me.Z.h.call(this)},Me.prototype.h=function(){Me.Z.h.call(this);const o=this.i;o.preventDefault?o.preventDefault():o.returnValue=!1};var ln="closure_listenable_"+(Math.random()*1e6|0),Jd=0;function Xd(o,u,h,p,A){this.listener=o,this.proxy=null,this.src=u,this.type=h,this.capture=!!p,this.ha=A,this.key=++Jd,this.da=this.fa=!1}function Os(o){o.da=!0,o.listener=null,o.proxy=null,o.src=null,o.ha=null}function Ls(o,u,h){for(const p in o)u.call(h,o[p],p,o)}function Zd(o,u){for(const h in o)u.call(void 0,o[h],h,o)}function xc(o){const u={};for(const h in o)u[h]=o[h];return u}const Nc="constructor hasOwnProperty isPrototypeOf propertyIsEnumerable toLocaleString toString valueOf".split(" ");function kc(o,u){let h,p;for(let A=1;A<arguments.length;A++){p=arguments[A];for(h in p)o[h]=p[h];for(let R=0;R<Nc.length;R++)h=Nc[R],Object.prototype.hasOwnProperty.call(p,h)&&(o[h]=p[h])}}function Ms(o){this.src=o,this.g={},this.h=0}Ms.prototype.add=function(o,u,h,p,A){const R=o.toString();o=this.g[R],o||(o=this.g[R]=[],this.h++);const k=uo(o,u,p,A);return k>-1?(u=o[k],h||(u.fa=!1)):(u=new Xd(u,this.src,R,!!p,A),u.fa=h,o.push(u)),u};function co(o,u){const h=u.type;if(h in o.g){var p=o.g[h],A=Array.prototype.indexOf.call(p,u,void 0),R;(R=A>=0)&&Array.prototype.splice.call(p,A,1),R&&(Os(u),o.g[h].length==0&&(delete o.g[h],o.h--))}}function uo(o,u,h,p){for(let A=0;A<o.length;++A){const R=o[A];if(!R.da&&R.listener==u&&R.capture==!!h&&R.ha==p)return A}return-1}var lo="closure_lm_"+(Math.random()*1e6|0),ho={};function Dc(o,u,h,p,A){if(Array.isArray(u)){for(let R=0;R<u.length;R++)Dc(o,u[R],h,p,A);return null}return h=Mc(h),o&&o[ln]?o.J(u,h,c(p)?!!p.capture:!1,A):ep(o,u,h,!1,p,A)}function ep(o,u,h,p,A,R){if(!u)throw Error("Invalid event type");const k=c(A)?!!A.capture:!!A;let K=po(o);if(K||(o[lo]=K=new Ms(o)),h=K.add(u,h,p,k,R),h.proxy)return h;if(p=tp(),h.proxy=p,p.src=o,p.listener=h,o.addEventListener)b||(A=k),A===void 0&&(A=!1),o.addEventListener(u.toString(),p,A);else if(o.attachEvent)o.attachEvent(Lc(u.toString()),p);else if(o.addListener&&o.removeListener)o.addListener(p);else throw Error("addEventListener and attachEvent are unavailable.");return h}function tp(){function o(h){return u.call(o.src,o.listener,h)}const u=np;return o}function Oc(o,u,h,p,A){if(Array.isArray(u))for(var R=0;R<u.length;R++)Oc(o,u[R],h,p,A);else p=c(p)?!!p.capture:!!p,h=Mc(h),o&&o[ln]?(o=o.i,R=String(u).toString(),R in o.g&&(u=o.g[R],h=uo(u,h,p,A),h>-1&&(Os(u[h]),Array.prototype.splice.call(u,h,1),u.length==0&&(delete o.g[R],o.h--)))):o&&(o=po(o))&&(u=o.g[u.toString()],o=-1,u&&(o=uo(u,h,p,A)),(h=o>-1?u[o]:null)&&fo(h))}function fo(o){if(typeof o!="number"&&o&&!o.da){var u=o.src;if(u&&u[ln])co(u.i,o);else{var h=o.type,p=o.proxy;u.removeEventListener?u.removeEventListener(h,p,o.capture):u.detachEvent?u.detachEvent(Lc(h),p):u.addListener&&u.removeListener&&u.removeListener(p),(h=po(u))?(co(h,o),h.h==0&&(h.src=null,u[lo]=null)):Os(o)}}}function Lc(o){return o in ho?ho[o]:ho[o]="on"+o}function np(o,u){if(o.da)o=!0;else{u=new Me(u,this);const h=o.listener,p=o.ha||o.src;o.fa&&fo(o),o=h.call(p,u)}return o}function po(o){return o=o[lo],o instanceof Ms?o:null}var mo="__closure_events_fn_"+(Math.random()*1e9>>>0);function Mc(o){return typeof o=="function"?o:(o[mo]||(o[mo]=function(u){return o.handleEvent(u)}),o[mo])}function Ve(){v.call(this),this.i=new Ms(this),this.M=this,this.G=null}m(Ve,v),Ve.prototype[ln]=!0,Ve.prototype.removeEventListener=function(o,u,h,p){Oc(this,o,u,h,p)};function Oe(o,u){var h,p=o.G;if(p)for(h=[];p;p=p.G)h.push(p);if(o=o.M,p=u.type||u,typeof u=="string")u=new w(u,o);else if(u instanceof w)u.target=u.target||o;else{var A=u;u=new w(p,o),kc(u,A)}A=!0;let R,k;if(h)for(k=h.length-1;k>=0;k--)R=u.g=h[k],A=Us(R,p,!0,u)&&A;if(R=u.g=o,A=Us(R,p,!0,u)&&A,A=Us(R,p,!1,u)&&A,h)for(k=0;k<h.length;k++)R=u.g=h[k],A=Us(R,p,!1,u)&&A}Ve.prototype.N=function(){if(Ve.Z.N.call(this),this.i){var o=this.i;for(const u in o.g){const h=o.g[u];for(let p=0;p<h.length;p++)Os(h[p]);delete o.g[u],o.h--}}this.G=null},Ve.prototype.J=function(o,u,h,p){return this.i.add(String(o),u,!1,h,p)},Ve.prototype.K=function(o,u,h,p){return this.i.add(String(o),u,!0,h,p)};function Us(o,u,h,p){if(u=o.i.g[String(u)],!u)return!0;u=u.concat();let A=!0;for(let R=0;R<u.length;++R){const k=u[R];if(k&&!k.da&&k.capture==h){const K=k.listener,ye=k.ha||k.src;k.fa&&co(o.i,k),A=K.call(ye,p)!==!1&&A}}return A&&!p.defaultPrevented}function rp(o,u){if(typeof o!="function")if(o&&typeof o.handleEvent=="function")o=f(o.handleEvent,o);else throw Error("Invalid listener argument");return Number(u)>2147483647?-1:a.setTimeout(o,u||0)}function Uc(o){o.g=rp(()=>{o.g=null,o.i&&(o.i=!1,Uc(o))},o.l);const u=o.h;o.h=null,o.m.apply(null,u)}class sp extends v{constructor(u,h){super(),this.m=u,this.l=h,this.h=null,this.i=!1,this.g=null}j(u){this.h=arguments,this.g?this.i=!0:Uc(this)}N(){super.N(),this.g&&(a.clearTimeout(this.g),this.g=null,this.i=!1,this.h=null)}}function yr(o){v.call(this),this.h=o,this.g={}}m(yr,v);var Fc=[];function Bc(o){Ls(o.g,function(u,h){this.g.hasOwnProperty(h)&&fo(u)},o),o.g={}}yr.prototype.N=function(){yr.Z.N.call(this),Bc(this)},yr.prototype.handleEvent=function(){throw Error("EventHandler.handleEvent not implemented")};var go=a.JSON.stringify,ip=a.JSON.parse,op=class{stringify(o){return a.JSON.stringify(o,void 0)}parse(o){return a.JSON.parse(o,void 0)}};function qc(){}function $c(){}var Er={OPEN:"a",hb:"b",ERROR:"c",tb:"d"};function _o(){w.call(this,"d")}m(_o,w);function yo(){w.call(this,"c")}m(yo,w);var hn={},jc=null;function Fs(){return jc=jc||new Ve}hn.Ia="serverreachability";function zc(o){w.call(this,hn.Ia,o)}m(zc,w);function wr(o){const u=Fs();Oe(u,new zc(u))}hn.STAT_EVENT="statevent";function Gc(o,u){w.call(this,hn.STAT_EVENT,o),this.stat=u}m(Gc,w);function Le(o){const u=Fs();Oe(u,new Gc(u,o))}hn.Ja="timingevent";function Wc(o,u){w.call(this,hn.Ja,o),this.size=u}m(Wc,w);function Tr(o,u){if(typeof o!="function")throw Error("Fn must not be null and must be a function");return a.setTimeout(function(){o()},u)}function Ir(){this.g=!0}Ir.prototype.ua=function(){this.g=!1};function ap(o,u,h,p,A,R){o.info(function(){if(o.g)if(R){var k="",K=R.split("&");for(let ne=0;ne<K.length;ne++){var ye=K[ne].split("=");if(ye.length>1){const we=ye[0];ye=ye[1];const ct=we.split("_");k=ct.length>=2&&ct[1]=="type"?k+(we+"="+ye+"&"):k+(we+"=redacted&")}}}else k=null;else k=R;return"XMLHTTP REQ ("+p+") [attempt "+A+"]: "+u+`
`+h+`
`+k})}function cp(o,u,h,p,A,R,k){o.info(function(){return"XMLHTTP RESP ("+p+") [ attempt "+A+"]: "+u+`
`+h+`
`+R+" "+k})}function Mn(o,u,h,p){o.info(function(){return"XMLHTTP TEXT ("+u+"): "+lp(o,h)+(p?" "+p:"")})}function up(o,u){o.info(function(){return"TIMEOUT: "+u})}Ir.prototype.info=function(){};function lp(o,u){if(!o.g)return u;if(!u)return null;try{const R=JSON.parse(u);if(R){for(o=0;o<R.length;o++)if(Array.isArray(R[o])){var h=R[o];if(!(h.length<2)){var p=h[1];if(Array.isArray(p)&&!(p.length<1)){var A=p[0];if(A!="noop"&&A!="stop"&&A!="close")for(let k=1;k<p.length;k++)p[k]=""}}}}return go(R)}catch{return u}}var Bs={NO_ERROR:0,cb:1,qb:2,pb:3,kb:4,ob:5,rb:6,Ga:7,TIMEOUT:8,ub:9},Hc={ib:"complete",Fb:"success",ERROR:"error",Ga:"abort",xb:"ready",yb:"readystatechange",TIMEOUT:"timeout",sb:"incrementaldata",wb:"progress",lb:"downloadprogress",Nb:"uploadprogress"},Kc;function Eo(){}m(Eo,qc),Eo.prototype.g=function(){return new XMLHttpRequest},Kc=new Eo;function vr(o){return encodeURIComponent(String(o))}function hp(o){var u=1;o=o.split(":");const h=[];for(;u>0&&o.length;)h.push(o.shift()),u--;return o.length&&h.push(o.join(":")),h}function Dt(o,u,h,p){this.j=o,this.i=u,this.l=h,this.S=p||1,this.V=new yr(this),this.H=45e3,this.J=null,this.o=!1,this.u=this.B=this.A=this.M=this.F=this.T=this.D=null,this.G=[],this.g=null,this.C=0,this.m=this.v=null,this.X=-1,this.K=!1,this.P=0,this.O=null,this.W=this.L=this.U=this.R=!1,this.h=new Qc}function Qc(){this.i=null,this.g="",this.h=!1}var Yc={},wo={};function To(o,u,h){o.M=1,o.A=$s(at(u)),o.u=h,o.R=!0,Jc(o,null)}function Jc(o,u){o.F=Date.now(),qs(o),o.B=at(o.A);var h=o.B,p=o.S;Array.isArray(p)||(p=[String(p)]),lu(h.i,"t",p),o.C=0,h=o.j.L,o.h=new Qc,o.g=Vu(o.j,h?u:null,!o.u),o.P>0&&(o.O=new sp(f(o.Y,o,o.g),o.P)),u=o.V,h=o.g,p=o.ba;var A="readystatechange";Array.isArray(A)||(A&&(Fc[0]=A.toString()),A=Fc);for(let R=0;R<A.length;R++){const k=Dc(h,A[R],p||u.handleEvent,!1,u.h||u);if(!k)break;u.g[k.key]=k}u=o.J?xc(o.J):{},o.u?(o.v||(o.v="POST"),u["Content-Type"]="application/x-www-form-urlencoded",o.g.ea(o.B,o.v,o.u,u)):(o.v="GET",o.g.ea(o.B,o.v,null,u)),wr(),ap(o.i,o.v,o.B,o.l,o.S,o.u)}Dt.prototype.ba=function(o){o=o.target;const u=this.O;u&&Mt(o)==3?u.j():this.Y(o)},Dt.prototype.Y=function(o){try{if(o==this.g)e:{const K=Mt(this.g),ye=this.g.ya(),ne=this.g.ca();if(!(K<3)&&(K!=3||this.g&&(this.h.h||this.g.la()||_u(this.g)))){this.K||K!=4||ye==7||(ye==8||ne<=0?wr(3):wr(2)),Io(this);var u=this.g.ca();this.X=u;var h=fp(this);if(this.o=u==200,cp(this.i,this.v,this.B,this.l,this.S,K,u),this.o){if(this.U&&!this.L){t:{if(this.g){var p,A=this.g;if((p=A.g?A.g.getResponseHeader("X-HTTP-Initial-Response"):null)&&!_(p)){var R=p;break t}}R=null}if(o=R)Mn(this.i,this.l,o,"Initial handshake response via X-HTTP-Initial-Response"),this.L=!0,vo(this,o);else{this.o=!1,this.m=3,Le(12),fn(this),Ar(this);break e}}if(this.R){o=!0;let we;for(;!this.K&&this.C<h.length;)if(we=dp(this,h),we==wo){K==4&&(this.m=4,Le(14),o=!1),Mn(this.i,this.l,null,"[Incomplete Response]");break}else if(we==Yc){this.m=4,Le(15),Mn(this.i,this.l,h,"[Invalid Chunk]"),o=!1;break}else Mn(this.i,this.l,we,null),vo(this,we);if(Xc(this)&&this.C!=0&&(this.h.g=this.h.g.slice(this.C),this.C=0),K!=4||h.length!=0||this.h.h||(this.m=1,Le(16),o=!1),this.o=this.o&&o,!o)Mn(this.i,this.l,h,"[Invalid Chunked Response]"),fn(this),Ar(this);else if(h.length>0&&!this.W){this.W=!0;var k=this.j;k.g==this&&k.aa&&!k.P&&(k.j.info("Great, no buffering proxy detected. Bytes received: "+h.length),xo(k),k.P=!0,Le(11))}}else Mn(this.i,this.l,h,null),vo(this,h);K==4&&fn(this),this.o&&!this.K&&(K==4?Au(this.j,this):(this.o=!1,qs(this)))}else Pp(this.g),u==400&&h.indexOf("Unknown SID")>0?(this.m=3,Le(12)):(this.m=0,Le(13)),fn(this),Ar(this)}}}catch{}finally{}};function fp(o){if(!Xc(o))return o.g.la();const u=_u(o.g);if(u==="")return"";let h="";const p=u.length,A=Mt(o.g)==4;if(!o.h.i){if(typeof TextDecoder>"u")return fn(o),Ar(o),"";o.h.i=new a.TextDecoder}for(let R=0;R<p;R++)o.h.h=!0,h+=o.h.i.decode(u[R],{stream:!(A&&R==p-1)});return u.length=0,o.h.g+=h,o.C=0,o.h.g}function Xc(o){return o.g?o.v=="GET"&&o.M!=2&&o.j.Aa:!1}function dp(o,u){var h=o.C,p=u.indexOf(`
`,h);return p==-1?wo:(h=Number(u.substring(h,p)),isNaN(h)?Yc:(p+=1,p+h>u.length?wo:(u=u.slice(p,p+h),o.C=p+h,u)))}Dt.prototype.cancel=function(){this.K=!0,fn(this)};function qs(o){o.T=Date.now()+o.H,Zc(o,o.H)}function Zc(o,u){if(o.D!=null)throw Error("WatchDog timer not null");o.D=Tr(f(o.aa,o),u)}function Io(o){o.D&&(a.clearTimeout(o.D),o.D=null)}Dt.prototype.aa=function(){this.D=null;const o=Date.now();o-this.T>=0?(up(this.i,this.B),this.M!=2&&(wr(),Le(17)),fn(this),this.m=2,Ar(this)):Zc(this,this.T-o)};function Ar(o){o.j.I==0||o.K||Au(o.j,o)}function fn(o){Io(o);var u=o.O;u&&typeof u.dispose=="function"&&u.dispose(),o.O=null,Bc(o.V),o.g&&(u=o.g,o.g=null,u.abort(),u.dispose())}function vo(o,u){try{var h=o.j;if(h.I!=0&&(h.g==o||Ao(h.h,o))){if(!o.L&&Ao(h.h,o)&&h.I==3){try{var p=h.Ba.g.parse(u)}catch{p=null}if(Array.isArray(p)&&p.length==3){var A=p;if(A[0]==0){e:if(!h.v){if(h.g)if(h.g.F+3e3<o.F)Hs(h),Gs(h);else break e;Co(h),Le(18)}}else h.xa=A[1],0<h.xa-h.K&&A[2]<37500&&h.F&&h.A==0&&!h.C&&(h.C=Tr(f(h.Va,h),6e3));nu(h.h)<=1&&h.ta&&(h.ta=void 0)}else pn(h,11)}else if((o.L||h.g==o)&&Hs(h),!_(u))for(A=h.Ba.g.parse(u),u=0;u<A.length;u++){let ne=A[u];const we=ne[0];if(!(we<=h.K))if(h.K=we,ne=ne[1],h.I==2)if(ne[0]=="c"){h.M=ne[1],h.ba=ne[2];const ct=ne[3];ct!=null&&(h.ka=ct,h.j.info("VER="+h.ka));const mn=ne[4];mn!=null&&(h.za=mn,h.j.info("SVER="+h.za));const Ut=ne[5];Ut!=null&&typeof Ut=="number"&&Ut>0&&(p=1.5*Ut,h.O=p,h.j.info("backChannelRequestTimeoutMs_="+p)),p=h;const Ft=o.g;if(Ft){const Qs=Ft.g?Ft.g.getResponseHeader("X-Client-Wire-Protocol"):null;if(Qs){var R=p.h;R.g||Qs.indexOf("spdy")==-1&&Qs.indexOf("quic")==-1&&Qs.indexOf("h2")==-1||(R.j=R.l,R.g=new Set,R.h&&(bo(R,R.h),R.h=null))}if(p.G){const No=Ft.g?Ft.g.getResponseHeader("X-HTTP-Session-Id"):null;No&&(p.wa=No,ie(p.J,p.G,No))}}h.I=3,h.l&&h.l.ra(),h.aa&&(h.T=Date.now()-o.F,h.j.info("Handshake RTT: "+h.T+"ms")),p=h;var k=o;if(p.na=Pu(p,p.L?p.ba:null,p.W),k.L){ru(p.h,k);var K=k,ye=p.O;ye&&(K.H=ye),K.D&&(Io(K),qs(K)),p.g=k}else Iu(p);h.i.length>0&&Ws(h)}else ne[0]!="stop"&&ne[0]!="close"||pn(h,7);else h.I==3&&(ne[0]=="stop"||ne[0]=="close"?ne[0]=="stop"?pn(h,7):So(h):ne[0]!="noop"&&h.l&&h.l.qa(ne),h.A=0)}}wr(4)}catch{}}var pp=class{constructor(o,u){this.g=o,this.map=u}};function eu(o){this.l=o||10,a.PerformanceNavigationTiming?(o=a.performance.getEntriesByType("navigation"),o=o.length>0&&(o[0].nextHopProtocol=="hq"||o[0].nextHopProtocol=="h2")):o=!!(a.chrome&&a.chrome.loadTimes&&a.chrome.loadTimes()&&a.chrome.loadTimes().wasFetchedViaSpdy),this.j=o?this.l:1,this.g=null,this.j>1&&(this.g=new Set),this.h=null,this.i=[]}function tu(o){return o.h?!0:o.g?o.g.size>=o.j:!1}function nu(o){return o.h?1:o.g?o.g.size:0}function Ao(o,u){return o.h?o.h==u:o.g?o.g.has(u):!1}function bo(o,u){o.g?o.g.add(u):o.h=u}function ru(o,u){o.h&&o.h==u?o.h=null:o.g&&o.g.has(u)&&o.g.delete(u)}eu.prototype.cancel=function(){if(this.i=su(this),this.h)this.h.cancel(),this.h=null;else if(this.g&&this.g.size!==0){for(const o of this.g.values())o.cancel();this.g.clear()}};function su(o){if(o.h!=null)return o.i.concat(o.h.G);if(o.g!=null&&o.g.size!==0){let u=o.i;for(const h of o.g.values())u=u.concat(h.G);return u}return V(o.i)}var iu=RegExp("^(?:([^:/?#.]+):)?(?://(?:([^\\\\/?#]*)@)?([^\\\\/?#]*?)(?::([0-9]+))?(?=[\\\\/?#]|$))?([^?#]+)?(?:\\?([^#]*))?(?:#([\\s\\S]*))?$");function mp(o,u){if(o){o=o.split("&");for(let h=0;h<o.length;h++){const p=o[h].indexOf("=");let A,R=null;p>=0?(A=o[h].substring(0,p),R=o[h].substring(p+1)):A=o[h],u(A,R?decodeURIComponent(R.replace(/\+/g," ")):"")}}}function Ot(o){this.g=this.o=this.j="",this.u=null,this.m=this.h="",this.l=!1;let u;o instanceof Ot?(this.l=o.l,br(this,o.j),this.o=o.o,this.g=o.g,Rr(this,o.u),this.h=o.h,Ro(this,hu(o.i)),this.m=o.m):o&&(u=String(o).match(iu))?(this.l=!1,br(this,u[1]||"",!0),this.o=Pr(u[2]||""),this.g=Pr(u[3]||"",!0),Rr(this,u[4]),this.h=Pr(u[5]||"",!0),Ro(this,u[6]||"",!0),this.m=Pr(u[7]||"")):(this.l=!1,this.i=new Sr(null,this.l))}Ot.prototype.toString=function(){const o=[];var u=this.j;u&&o.push(Vr(u,ou,!0),":");var h=this.g;return(h||u=="file")&&(o.push("//"),(u=this.o)&&o.push(Vr(u,ou,!0),"@"),o.push(vr(h).replace(/%25([0-9a-fA-F]{2})/g,"%$1")),h=this.u,h!=null&&o.push(":",String(h))),(h=this.h)&&(this.g&&h.charAt(0)!="/"&&o.push("/"),o.push(Vr(h,h.charAt(0)=="/"?yp:_p,!0))),(h=this.i.toString())&&o.push("?",h),(h=this.m)&&o.push("#",Vr(h,wp)),o.join("")},Ot.prototype.resolve=function(o){const u=at(this);let h=!!o.j;h?br(u,o.j):h=!!o.o,h?u.o=o.o:h=!!o.g,h?u.g=o.g:h=o.u!=null;var p=o.h;if(h)Rr(u,o.u);else if(h=!!o.h){if(p.charAt(0)!="/")if(this.g&&!this.h)p="/"+p;else{var A=u.h.lastIndexOf("/");A!=-1&&(p=u.h.slice(0,A+1)+p)}if(A=p,A==".."||A==".")p="";else if(A.indexOf("./")!=-1||A.indexOf("/.")!=-1){p=A.lastIndexOf("/",0)==0,A=A.split("/");const R=[];for(let k=0;k<A.length;){const K=A[k++];K=="."?p&&k==A.length&&R.push(""):K==".."?((R.length>1||R.length==1&&R[0]!="")&&R.pop(),p&&k==A.length&&R.push("")):(R.push(K),p=!0)}p=R.join("/")}else p=A}return h?u.h=p:h=o.i.toString()!=="",h?Ro(u,hu(o.i)):h=!!o.m,h&&(u.m=o.m),u};function at(o){return new Ot(o)}function br(o,u,h){o.j=h?Pr(u,!0):u,o.j&&(o.j=o.j.replace(/:$/,""))}function Rr(o,u){if(u){if(u=Number(u),isNaN(u)||u<0)throw Error("Bad port number "+u);o.u=u}else o.u=null}function Ro(o,u,h){u instanceof Sr?(o.i=u,Tp(o.i,o.l)):(h||(u=Vr(u,Ep)),o.i=new Sr(u,o.l))}function ie(o,u,h){o.i.set(u,h)}function $s(o){return ie(o,"zx",Math.floor(Math.random()*2147483648).toString(36)+Math.abs(Math.floor(Math.random()*2147483648)^Date.now()).toString(36)),o}function Pr(o,u){return o?u?decodeURI(o.replace(/%25/g,"%2525")):decodeURIComponent(o):""}function Vr(o,u,h){return typeof o=="string"?(o=encodeURI(o).replace(u,gp),h&&(o=o.replace(/%25([0-9a-fA-F]{2})/g,"%$1")),o):null}function gp(o){return o=o.charCodeAt(0),"%"+(o>>4&15).toString(16)+(o&15).toString(16)}var ou=/[#\/\?@]/g,_p=/[#\?:]/g,yp=/[#\?]/g,Ep=/[#\?@]/g,wp=/#/g;function Sr(o,u){this.h=this.g=null,this.i=o||null,this.j=!!u}function dn(o){o.g||(o.g=new Map,o.h=0,o.i&&mp(o.i,function(u,h){o.add(decodeURIComponent(u.replace(/\+/g," ")),h)}))}n=Sr.prototype,n.add=function(o,u){dn(this),this.i=null,o=Un(this,o);let h=this.g.get(o);return h||this.g.set(o,h=[]),h.push(u),this.h+=1,this};function au(o,u){dn(o),u=Un(o,u),o.g.has(u)&&(o.i=null,o.h-=o.g.get(u).length,o.g.delete(u))}function cu(o,u){return dn(o),u=Un(o,u),o.g.has(u)}n.forEach=function(o,u){dn(this),this.g.forEach(function(h,p){h.forEach(function(A){o.call(u,A,p,this)},this)},this)};function uu(o,u){dn(o);let h=[];if(typeof u=="string")cu(o,u)&&(h=h.concat(o.g.get(Un(o,u))));else for(o=Array.from(o.g.values()),u=0;u<o.length;u++)h=h.concat(o[u]);return h}n.set=function(o,u){return dn(this),this.i=null,o=Un(this,o),cu(this,o)&&(this.h-=this.g.get(o).length),this.g.set(o,[u]),this.h+=1,this},n.get=function(o,u){return o?(o=uu(this,o),o.length>0?String(o[0]):u):u};function lu(o,u,h){au(o,u),h.length>0&&(o.i=null,o.g.set(Un(o,u),V(h)),o.h+=h.length)}n.toString=function(){if(this.i)return this.i;if(!this.g)return"";const o=[],u=Array.from(this.g.keys());for(let p=0;p<u.length;p++){var h=u[p];const A=vr(h);h=uu(this,h);for(let R=0;R<h.length;R++){let k=A;h[R]!==""&&(k+="="+vr(h[R])),o.push(k)}}return this.i=o.join("&")};function hu(o){const u=new Sr;return u.i=o.i,o.g&&(u.g=new Map(o.g),u.h=o.h),u}function Un(o,u){return u=String(u),o.j&&(u=u.toLowerCase()),u}function Tp(o,u){u&&!o.j&&(dn(o),o.i=null,o.g.forEach(function(h,p){const A=p.toLowerCase();p!=A&&(au(this,p),lu(this,A,h))},o)),o.j=u}function Ip(o,u){const h=new Ir;if(a.Image){const p=new Image;p.onload=d(Lt,h,"TestLoadImage: loaded",!0,u,p),p.onerror=d(Lt,h,"TestLoadImage: error",!1,u,p),p.onabort=d(Lt,h,"TestLoadImage: abort",!1,u,p),p.ontimeout=d(Lt,h,"TestLoadImage: timeout",!1,u,p),a.setTimeout(function(){p.ontimeout&&p.ontimeout()},1e4),p.src=o}else u(!1)}function vp(o,u){const h=new Ir,p=new AbortController,A=setTimeout(()=>{p.abort(),Lt(h,"TestPingServer: timeout",!1,u)},1e4);fetch(o,{signal:p.signal}).then(R=>{clearTimeout(A),R.ok?Lt(h,"TestPingServer: ok",!0,u):Lt(h,"TestPingServer: server error",!1,u)}).catch(()=>{clearTimeout(A),Lt(h,"TestPingServer: error",!1,u)})}function Lt(o,u,h,p,A){try{A&&(A.onload=null,A.onerror=null,A.onabort=null,A.ontimeout=null),p(h)}catch{}}function Ap(){this.g=new op}function Po(o){this.i=o.Sb||null,this.h=o.ab||!1}m(Po,qc),Po.prototype.g=function(){return new js(this.i,this.h)};function js(o,u){Ve.call(this),this.H=o,this.o=u,this.m=void 0,this.status=this.readyState=0,this.responseType=this.responseText=this.response=this.statusText="",this.onreadystatechange=null,this.A=new Headers,this.h=null,this.F="GET",this.D="",this.g=!1,this.B=this.j=this.l=null,this.v=new AbortController}m(js,Ve),n=js.prototype,n.open=function(o,u){if(this.readyState!=0)throw this.abort(),Error("Error reopening a connection");this.F=o,this.D=u,this.readyState=1,xr(this)},n.send=function(o){if(this.readyState!=1)throw this.abort(),Error("need to call open() first. ");if(this.v.signal.aborted)throw this.abort(),Error("Request was aborted.");this.g=!0;const u={headers:this.A,method:this.F,credentials:this.m,cache:void 0,signal:this.v.signal};o&&(u.body=o),(this.H||a).fetch(new Request(this.D,u)).then(this.Pa.bind(this),this.ga.bind(this))},n.abort=function(){this.response=this.responseText="",this.A=new Headers,this.status=0,this.v.abort(),this.j&&this.j.cancel("Request was aborted.").catch(()=>{}),this.readyState>=1&&this.g&&this.readyState!=4&&(this.g=!1,Cr(this)),this.readyState=0},n.Pa=function(o){if(this.g&&(this.l=o,this.h||(this.status=this.l.status,this.statusText=this.l.statusText,this.h=o.headers,this.readyState=2,xr(this)),this.g&&(this.readyState=3,xr(this),this.g)))if(this.responseType==="arraybuffer")o.arrayBuffer().then(this.Na.bind(this),this.ga.bind(this));else if(typeof a.ReadableStream<"u"&&"body"in o){if(this.j=o.body.getReader(),this.o){if(this.responseType)throw Error('responseType must be empty for "streamBinaryChunks" mode responses.');this.response=[]}else this.response=this.responseText="",this.B=new TextDecoder;fu(this)}else o.text().then(this.Oa.bind(this),this.ga.bind(this))};function fu(o){o.j.read().then(o.Ma.bind(o)).catch(o.ga.bind(o))}n.Ma=function(o){if(this.g){if(this.o&&o.value)this.response.push(o.value);else if(!this.o){var u=o.value?o.value:new Uint8Array(0);(u=this.B.decode(u,{stream:!o.done}))&&(this.response=this.responseText+=u)}o.done?Cr(this):xr(this),this.readyState==3&&fu(this)}},n.Oa=function(o){this.g&&(this.response=this.responseText=o,Cr(this))},n.Na=function(o){this.g&&(this.response=o,Cr(this))},n.ga=function(){this.g&&Cr(this)};function Cr(o){o.readyState=4,o.l=null,o.j=null,o.B=null,xr(o)}n.setRequestHeader=function(o,u){this.A.append(o,u)},n.getResponseHeader=function(o){return this.h&&this.h.get(o.toLowerCase())||""},n.getAllResponseHeaders=function(){if(!this.h)return"";const o=[],u=this.h.entries();for(var h=u.next();!h.done;)h=h.value,o.push(h[0]+": "+h[1]),h=u.next();return o.join(`\r
`)};function xr(o){o.onreadystatechange&&o.onreadystatechange.call(o)}Object.defineProperty(js.prototype,"withCredentials",{get:function(){return this.m==="include"},set:function(o){this.m=o?"include":"same-origin"}});function du(o){let u="";return Ls(o,function(h,p){u+=p,u+=":",u+=h,u+=`\r
`}),u}function Vo(o,u,h){e:{for(p in h){var p=!1;break e}p=!0}p||(h=du(h),typeof o=="string"?h!=null&&vr(h):ie(o,u,h))}function ce(o){Ve.call(this),this.headers=new Map,this.L=o||null,this.h=!1,this.g=null,this.D="",this.o=0,this.l="",this.j=this.B=this.v=this.A=!1,this.m=null,this.F="",this.H=!1}m(ce,Ve);var bp=/^https?$/i,Rp=["POST","PUT"];n=ce.prototype,n.Fa=function(o){this.H=o},n.ea=function(o,u,h,p){if(this.g)throw Error("[goog.net.XhrIo] Object is active with another request="+this.D+"; newUri="+o);u=u?u.toUpperCase():"GET",this.D=o,this.l="",this.o=0,this.A=!1,this.h=!0,this.g=this.L?this.L.g():Kc.g(),this.g.onreadystatechange=I(f(this.Ca,this));try{this.B=!0,this.g.open(u,String(o),!0),this.B=!1}catch(R){pu(this,R);return}if(o=h||"",h=new Map(this.headers),p)if(Object.getPrototypeOf(p)===Object.prototype)for(var A in p)h.set(A,p[A]);else if(typeof p.keys=="function"&&typeof p.get=="function")for(const R of p.keys())h.set(R,p.get(R));else throw Error("Unknown input type for opt_headers: "+String(p));p=Array.from(h.keys()).find(R=>R.toLowerCase()=="content-type"),A=a.FormData&&o instanceof a.FormData,!(Array.prototype.indexOf.call(Rp,u,void 0)>=0)||p||A||h.set("Content-Type","application/x-www-form-urlencoded;charset=utf-8");for(const[R,k]of h)this.g.setRequestHeader(R,k);this.F&&(this.g.responseType=this.F),"withCredentials"in this.g&&this.g.withCredentials!==this.H&&(this.g.withCredentials=this.H);try{this.m&&(clearTimeout(this.m),this.m=null),this.v=!0,this.g.send(o),this.v=!1}catch(R){pu(this,R)}};function pu(o,u){o.h=!1,o.g&&(o.j=!0,o.g.abort(),o.j=!1),o.l=u,o.o=5,mu(o),zs(o)}function mu(o){o.A||(o.A=!0,Oe(o,"complete"),Oe(o,"error"))}n.abort=function(o){this.g&&this.h&&(this.h=!1,this.j=!0,this.g.abort(),this.j=!1,this.o=o||7,Oe(this,"complete"),Oe(this,"abort"),zs(this))},n.N=function(){this.g&&(this.h&&(this.h=!1,this.j=!0,this.g.abort(),this.j=!1),zs(this,!0)),ce.Z.N.call(this)},n.Ca=function(){this.u||(this.B||this.v||this.j?gu(this):this.Xa())},n.Xa=function(){gu(this)};function gu(o){if(o.h&&typeof i<"u"){if(o.v&&Mt(o)==4)setTimeout(o.Ca.bind(o),0);else if(Oe(o,"readystatechange"),Mt(o)==4){o.h=!1;try{const R=o.ca();e:switch(R){case 200:case 201:case 202:case 204:case 206:case 304:case 1223:var u=!0;break e;default:u=!1}var h;if(!(h=u)){var p;if(p=R===0){let k=String(o.D).match(iu)[1]||null;!k&&a.self&&a.self.location&&(k=a.self.location.protocol.slice(0,-1)),p=!bp.test(k?k.toLowerCase():"")}h=p}if(h)Oe(o,"complete"),Oe(o,"success");else{o.o=6;try{var A=Mt(o)>2?o.g.statusText:""}catch{A=""}o.l=A+" ["+o.ca()+"]",mu(o)}}finally{zs(o)}}}}function zs(o,u){if(o.g){o.m&&(clearTimeout(o.m),o.m=null);const h=o.g;o.g=null,u||Oe(o,"ready");try{h.onreadystatechange=null}catch{}}}n.isActive=function(){return!!this.g};function Mt(o){return o.g?o.g.readyState:0}n.ca=function(){try{return Mt(this)>2?this.g.status:-1}catch{return-1}},n.la=function(){try{return this.g?this.g.responseText:""}catch{return""}},n.La=function(o){if(this.g){var u=this.g.responseText;return o&&u.indexOf(o)==0&&(u=u.substring(o.length)),ip(u)}};function _u(o){try{if(!o.g)return null;if("response"in o.g)return o.g.response;switch(o.F){case"":case"text":return o.g.responseText;case"arraybuffer":if("mozResponseArrayBuffer"in o.g)return o.g.mozResponseArrayBuffer}return null}catch{return null}}function Pp(o){const u={};o=(o.g&&Mt(o)>=2&&o.g.getAllResponseHeaders()||"").split(`\r
`);for(let p=0;p<o.length;p++){if(_(o[p]))continue;var h=hp(o[p]);const A=h[0];if(h=h[1],typeof h!="string")continue;h=h.trim();const R=u[A]||[];u[A]=R,R.push(h)}Zd(u,function(p){return p.join(", ")})}n.ya=function(){return this.o},n.Ha=function(){return typeof this.l=="string"?this.l:String(this.l)};function Nr(o,u,h){return h&&h.internalChannelParams&&h.internalChannelParams[o]||u}function yu(o){this.za=0,this.i=[],this.j=new Ir,this.ba=this.na=this.J=this.W=this.g=this.wa=this.G=this.H=this.u=this.U=this.o=null,this.Ya=this.V=0,this.Sa=Nr("failFast",!1,o),this.F=this.C=this.v=this.m=this.l=null,this.X=!0,this.xa=this.K=-1,this.Y=this.A=this.D=0,this.Qa=Nr("baseRetryDelayMs",5e3,o),this.Za=Nr("retryDelaySeedMs",1e4,o),this.Ta=Nr("forwardChannelMaxRetries",2,o),this.va=Nr("forwardChannelRequestTimeoutMs",2e4,o),this.ma=o&&o.xmlHttpFactory||void 0,this.Ua=o&&o.Rb||void 0,this.Aa=o&&o.useFetchStreams||!1,this.O=void 0,this.L=o&&o.supportsCrossDomainXhr||!1,this.M="",this.h=new eu(o&&o.concurrentRequestLimit),this.Ba=new Ap,this.S=o&&o.fastHandshake||!1,this.R=o&&o.encodeInitMessageHeaders||!1,this.S&&this.R&&(this.R=!1),this.Ra=o&&o.Pb||!1,o&&o.ua&&this.j.ua(),o&&o.forceLongPolling&&(this.X=!1),this.aa=!this.S&&this.X&&o&&o.detectBufferingProxy||!1,this.ia=void 0,o&&o.longPollingTimeout&&o.longPollingTimeout>0&&(this.ia=o.longPollingTimeout),this.ta=void 0,this.T=0,this.P=!1,this.ja=this.B=null}n=yu.prototype,n.ka=8,n.I=1,n.connect=function(o,u,h,p){Le(0),this.W=o,this.H=u||{},h&&p!==void 0&&(this.H.OSID=h,this.H.OAID=p),this.F=this.X,this.J=Pu(this,null,this.W),Ws(this)};function So(o){if(Eu(o),o.I==3){var u=o.V++,h=at(o.J);if(ie(h,"SID",o.M),ie(h,"RID",u),ie(h,"TYPE","terminate"),kr(o,h),u=new Dt(o,o.j,u),u.M=2,u.A=$s(at(h)),h=!1,a.navigator&&a.navigator.sendBeacon)try{h=a.navigator.sendBeacon(u.A.toString(),"")}catch{}!h&&a.Image&&(new Image().src=u.A,h=!0),h||(u.g=Vu(u.j,null),u.g.ea(u.A)),u.F=Date.now(),qs(u)}Ru(o)}function Gs(o){o.g&&(xo(o),o.g.cancel(),o.g=null)}function Eu(o){Gs(o),o.v&&(a.clearTimeout(o.v),o.v=null),Hs(o),o.h.cancel(),o.m&&(typeof o.m=="number"&&a.clearTimeout(o.m),o.m=null)}function Ws(o){if(!tu(o.h)&&!o.m){o.m=!0;var u=o.Ea;ge||g(),_e||(ge(),_e=!0),T.add(u,o),o.D=0}}function Vp(o,u){return nu(o.h)>=o.h.j-(o.m?1:0)?!1:o.m?(o.i=u.G.concat(o.i),!0):o.I==1||o.I==2||o.D>=(o.Sa?0:o.Ta)?!1:(o.m=Tr(f(o.Ea,o,u),bu(o,o.D)),o.D++,!0)}n.Ea=function(o){if(this.m)if(this.m=null,this.I==1){if(!o){this.V=Math.floor(Math.random()*1e5),o=this.V++;const A=new Dt(this,this.j,o);let R=this.o;if(this.U&&(R?(R=xc(R),kc(R,this.U)):R=this.U),this.u!==null||this.R||(A.J=R,R=null),this.S)e:{for(var u=0,h=0;h<this.i.length;h++){t:{var p=this.i[h];if("__data__"in p.map&&(p=p.map.__data__,typeof p=="string")){p=p.length;break t}p=void 0}if(p===void 0)break;if(u+=p,u>4096){u=h;break e}if(u===4096||h===this.i.length-1){u=h+1;break e}}u=1e3}else u=1e3;u=Tu(this,A,u),h=at(this.J),ie(h,"RID",o),ie(h,"CVER",22),this.G&&ie(h,"X-HTTP-Session-Id",this.G),kr(this,h),R&&(this.R?u="headers="+vr(du(R))+"&"+u:this.u&&Vo(h,this.u,R)),bo(this.h,A),this.Ra&&ie(h,"TYPE","init"),this.S?(ie(h,"$req",u),ie(h,"SID","null"),A.U=!0,To(A,h,null)):To(A,h,u),this.I=2}}else this.I==3&&(o?wu(this,o):this.i.length==0||tu(this.h)||wu(this))};function wu(o,u){var h;u?h=u.l:h=o.V++;const p=at(o.J);ie(p,"SID",o.M),ie(p,"RID",h),ie(p,"AID",o.K),kr(o,p),o.u&&o.o&&Vo(p,o.u,o.o),h=new Dt(o,o.j,h,o.D+1),o.u===null&&(h.J=o.o),u&&(o.i=u.G.concat(o.i)),u=Tu(o,h,1e3),h.H=Math.round(o.va*.5)+Math.round(o.va*.5*Math.random()),bo(o.h,h),To(h,p,u)}function kr(o,u){o.H&&Ls(o.H,function(h,p){ie(u,p,h)}),o.l&&Ls({},function(h,p){ie(u,p,h)})}function Tu(o,u,h){h=Math.min(o.i.length,h);const p=o.l?f(o.l.Ka,o.l,o):null;e:{var A=o.i;let K=-1;for(;;){const ye=["count="+h];K==-1?h>0?(K=A[0].g,ye.push("ofs="+K)):K=0:ye.push("ofs="+K);let ne=!0;for(let we=0;we<h;we++){var R=A[we].g;const ct=A[we].map;if(R-=K,R<0)K=Math.max(0,A[we].g-100),ne=!1;else try{R="req"+R+"_"||"";try{var k=ct instanceof Map?ct:Object.entries(ct);for(const[mn,Ut]of k){let Ft=Ut;c(Ut)&&(Ft=go(Ut)),ye.push(R+mn+"="+encodeURIComponent(Ft))}}catch(mn){throw ye.push(R+"type="+encodeURIComponent("_badmap")),mn}}catch{p&&p(ct)}}if(ne){k=ye.join("&");break e}}k=void 0}return o=o.i.splice(0,h),u.G=o,k}function Iu(o){if(!o.g&&!o.v){o.Y=1;var u=o.Da;ge||g(),_e||(ge(),_e=!0),T.add(u,o),o.A=0}}function Co(o){return o.g||o.v||o.A>=3?!1:(o.Y++,o.v=Tr(f(o.Da,o),bu(o,o.A)),o.A++,!0)}n.Da=function(){if(this.v=null,vu(this),this.aa&&!(this.P||this.g==null||this.T<=0)){var o=4*this.T;this.j.info("BP detection timer enabled: "+o),this.B=Tr(f(this.Wa,this),o)}},n.Wa=function(){this.B&&(this.B=null,this.j.info("BP detection timeout reached."),this.j.info("Buffering proxy detected and switch to long-polling!"),this.F=!1,this.P=!0,Le(10),Gs(this),vu(this))};function xo(o){o.B!=null&&(a.clearTimeout(o.B),o.B=null)}function vu(o){o.g=new Dt(o,o.j,"rpc",o.Y),o.u===null&&(o.g.J=o.o),o.g.P=0;var u=at(o.na);ie(u,"RID","rpc"),ie(u,"SID",o.M),ie(u,"AID",o.K),ie(u,"CI",o.F?"0":"1"),!o.F&&o.ia&&ie(u,"TO",o.ia),ie(u,"TYPE","xmlhttp"),kr(o,u),o.u&&o.o&&Vo(u,o.u,o.o),o.O&&(o.g.H=o.O);var h=o.g;o=o.ba,h.M=1,h.A=$s(at(u)),h.u=null,h.R=!0,Jc(h,o)}n.Va=function(){this.C!=null&&(this.C=null,Gs(this),Co(this),Le(19))};function Hs(o){o.C!=null&&(a.clearTimeout(o.C),o.C=null)}function Au(o,u){var h=null;if(o.g==u){Hs(o),xo(o),o.g=null;var p=2}else if(Ao(o.h,u))h=u.G,ru(o.h,u),p=1;else return;if(o.I!=0){if(u.o)if(p==1){h=u.u?u.u.length:0,u=Date.now()-u.F;var A=o.D;p=Fs(),Oe(p,new Wc(p,h)),Ws(o)}else Iu(o);else if(A=u.m,A==3||A==0&&u.X>0||!(p==1&&Vp(o,u)||p==2&&Co(o)))switch(h&&h.length>0&&(u=o.h,u.i=u.i.concat(h)),A){case 1:pn(o,5);break;case 4:pn(o,10);break;case 3:pn(o,6);break;default:pn(o,2)}}}function bu(o,u){let h=o.Qa+Math.floor(Math.random()*o.Za);return o.isActive()||(h*=2),h*u}function pn(o,u){if(o.j.info("Error code "+u),u==2){var h=f(o.bb,o),p=o.Ua;const A=!p;p=new Ot(p||"//www.google.com/images/cleardot.gif"),a.location&&a.location.protocol=="http"||br(p,"https"),$s(p),A?Ip(p.toString(),h):vp(p.toString(),h)}else Le(2);o.I=0,o.l&&o.l.pa(u),Ru(o),Eu(o)}n.bb=function(o){o?(this.j.info("Successfully pinged google.com"),Le(2)):(this.j.info("Failed to ping google.com"),Le(1))};function Ru(o){if(o.I=0,o.ja=[],o.l){const u=su(o.h);(u.length!=0||o.i.length!=0)&&(x(o.ja,u),x(o.ja,o.i),o.h.i.length=0,V(o.i),o.i.length=0),o.l.oa()}}function Pu(o,u,h){var p=h instanceof Ot?at(h):new Ot(h);if(p.g!="")u&&(p.g=u+"."+p.g),Rr(p,p.u);else{var A=a.location;p=A.protocol,u=u?u+"."+A.hostname:A.hostname,A=+A.port;const R=new Ot(null);p&&br(R,p),u&&(R.g=u),A&&Rr(R,A),h&&(R.h=h),p=R}return h=o.G,u=o.wa,h&&u&&ie(p,h,u),ie(p,"VER",o.ka),kr(o,p),p}function Vu(o,u,h){if(u&&!o.L)throw Error("Can't create secondary domain capable XhrIo object.");return u=o.Aa&&!o.ma?new ce(new Po({ab:h})):new ce(o.ma),u.Fa(o.L),u}n.isActive=function(){return!!this.l&&this.l.isActive(this)};function Su(){}n=Su.prototype,n.ra=function(){},n.qa=function(){},n.pa=function(){},n.oa=function(){},n.isActive=function(){return!0},n.Ka=function(){};function Ks(){}Ks.prototype.g=function(o,u){return new Ge(o,u)};function Ge(o,u){Ve.call(this),this.g=new yu(u),this.l=o,this.h=u&&u.messageUrlParams||null,o=u&&u.messageHeaders||null,u&&u.clientProtocolHeaderRequired&&(o?o["X-Client-Protocol"]="webchannel":o={"X-Client-Protocol":"webchannel"}),this.g.o=o,o=u&&u.initMessageHeaders||null,u&&u.messageContentType&&(o?o["X-WebChannel-Content-Type"]=u.messageContentType:o={"X-WebChannel-Content-Type":u.messageContentType}),u&&u.sa&&(o?o["X-WebChannel-Client-Profile"]=u.sa:o={"X-WebChannel-Client-Profile":u.sa}),this.g.U=o,(o=u&&u.Qb)&&!_(o)&&(this.g.u=o),this.A=u&&u.supportsCrossDomainXhr||!1,this.v=u&&u.sendRawJson||!1,(u=u&&u.httpSessionIdParam)&&!_(u)&&(this.g.G=u,o=this.h,o!==null&&u in o&&(o=this.h,u in o&&delete o[u])),this.j=new Fn(this)}m(Ge,Ve),Ge.prototype.m=function(){this.g.l=this.j,this.A&&(this.g.L=!0),this.g.connect(this.l,this.h||void 0)},Ge.prototype.close=function(){So(this.g)},Ge.prototype.o=function(o){var u=this.g;if(typeof o=="string"){var h={};h.__data__=o,o=h}else this.v&&(h={},h.__data__=go(o),o=h);u.i.push(new pp(u.Ya++,o)),u.I==3&&Ws(u)},Ge.prototype.N=function(){this.g.l=null,delete this.j,So(this.g),delete this.g,Ge.Z.N.call(this)};function Cu(o){_o.call(this),o.__headers__&&(this.headers=o.__headers__,this.statusCode=o.__status__,delete o.__headers__,delete o.__status__);var u=o.__sm__;if(u){e:{for(const h in u){o=h;break e}o=void 0}(this.i=o)&&(o=this.i,u=u!==null&&o in u?u[o]:void 0),this.data=u}else this.data=o}m(Cu,_o);function xu(){yo.call(this),this.status=1}m(xu,yo);function Fn(o){this.g=o}m(Fn,Su),Fn.prototype.ra=function(){Oe(this.g,"a")},Fn.prototype.qa=function(o){Oe(this.g,new Cu(o))},Fn.prototype.pa=function(o){Oe(this.g,new xu)},Fn.prototype.oa=function(){Oe(this.g,"b")},Ks.prototype.createWebChannel=Ks.prototype.g,Ge.prototype.send=Ge.prototype.o,Ge.prototype.open=Ge.prototype.m,Ge.prototype.close=Ge.prototype.close,Yh=function(){return new Ks},Qh=function(){return Fs()},Kh=hn,Qo={jb:0,mb:1,nb:2,Hb:3,Mb:4,Jb:5,Kb:6,Ib:7,Gb:8,Lb:9,PROXY:10,NOPROXY:11,Eb:12,Ab:13,Bb:14,zb:15,Cb:16,Db:17,fb:18,eb:19,gb:20},Bs.NO_ERROR=0,Bs.TIMEOUT=8,Bs.HTTP_ERROR=6,ci=Bs,Hc.COMPLETE="complete",Hh=Hc,$c.EventType=Er,Er.OPEN="a",Er.CLOSE="b",Er.ERROR="c",Er.MESSAGE="d",Ve.prototype.listen=Ve.prototype.J,Lr=$c,ce.prototype.listenOnce=ce.prototype.K,ce.prototype.getLastError=ce.prototype.Ha,ce.prototype.getLastErrorCode=ce.prototype.ya,ce.prototype.getStatus=ce.prototype.ca,ce.prototype.getResponseJson=ce.prototype.La,ce.prototype.getResponseText=ce.prototype.la,ce.prototype.send=ce.prototype.ea,ce.prototype.setWithCredentials=ce.prototype.Fa,Wh=ce}).apply(typeof Js<"u"?Js:typeof self<"u"?self:typeof window<"u"?window:{});/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let lr="13.1.0";function J_(n){lr=n}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *//**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Vn=new ga("@firebase/firestore");function Bn(){return Vn.logLevel}function L(n,...e){if(Vn.logLevel<=X.DEBUG){const t=e.map(Pa);Vn.debug(`Firestore (${lr}): ${n}`,...t)}}function Ct(n,...e){if(Vn.logLevel<=X.ERROR){const t=e.map(Pa);Vn.error(`Firestore (${lr}): ${n}`,...t)}}function it(n,...e){if(Vn.logLevel<=X.WARN){const t=e.map(Pa);Vn.warn(`Firestore (${lr}): ${n}`,...t)}}function Pa(n){if(typeof n=="string")return n;try{return(function(t){return JSON.stringify(t)})(n)}catch{return n}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function q(n,e,t){let r="Unexpected state";typeof e=="string"?r=e:t=e,Jh(n,r,t)}function Jh(n,e,t){let r=`FIRESTORE (${lr}) INTERNAL ASSERTION FAILED: ${e} (ID: ${n.toString(16)})`;if(t!==void 0)try{r+=" CONTEXT: "+JSON.stringify(t)}catch{r+=" CONTEXT: "+t}throw Ct(r),new Error(r)}function U(n,e,t,r){let s="Unexpected state";typeof t=="string"?s=t:r=t,n||Jh(e,s,r)}function H(n,e){return n}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function X_(n){const e=typeof self<"u"&&(self.crypto||self.msCrypto),t=new Uint8Array(n);if(e&&typeof e.getRandomValues=="function")e.getRandomValues(t);else for(let r=0;r<n;r++)t[r]=Math.floor(256*Math.random());return t}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Va{static newId(){const e="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",t=62*Math.floor(4.129032258064516);let r="";for(;r.length<20;){const s=X_(40);for(let i=0;i<s.length;++i)r.length<20&&s[i]<t&&(r+=e.charAt(s[i]%62))}return r}}function Q(n,e){return n<e?-1:n>e?1:0}function Jr(n,e){const t=Math.min(n.length,e.length);for(let r=0;r<t;r++){const s=n.charAt(r),i=e.charAt(r);if(s!==i)return Mo(s)===Mo(i)?Q(s,i):Mo(s)?1:-1}return Q(n.length,e.length)}const Z_=55296,ey=57343;function Mo(n){const e=n.charCodeAt(0);return e>=Z_&&e<=ey}function Zn(n,e,t){return n.length===e.length&&n.every(((r,s)=>t(r,e[s])))}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class oe{constructor(e,t){this.comparator=e,this.root=t||Re.EMPTY}insert(e,t){return new oe(this.comparator,this.root.insert(e,t,this.comparator).copy(null,null,Re.BLACK,null,null))}remove(e){return new oe(this.comparator,this.root.remove(e,this.comparator).copy(null,null,Re.BLACK,null,null))}get(e){let t=this.root;for(;!t.isEmpty();){const r=this.comparator(e,t.key);if(r===0)return t.value;r<0?t=t.left:r>0&&(t=t.right)}return null}indexOf(e){let t=0,r=this.root;for(;!r.isEmpty();){const s=this.comparator(e,r.key);if(s===0)return t+r.left.size;s<0?r=r.left:(t+=r.left.size+1,r=r.right)}return-1}isEmpty(){return this.root.isEmpty()}get size(){return this.root.size}minKey(){return this.root.minKey()}maxKey(){return this.root.maxKey()}inorderTraversal(e){return this.root.inorderTraversal(e)}forEach(e){this.inorderTraversal(((t,r)=>(e(t,r),!1)))}toString(){const e=[];return this.inorderTraversal(((t,r)=>(e.push(`${t}:${r}`),!1))),`{${e.join(", ")}}`}reverseTraversal(e){return this.root.reverseTraversal(e)}getIterator(){return new Xs(this.root,null,this.comparator,!1)}getIteratorFrom(e){return new Xs(this.root,e,this.comparator,!1)}getReverseIterator(){return new Xs(this.root,null,this.comparator,!0)}getReverseIteratorFrom(e){return new Xs(this.root,e,this.comparator,!0)}}class Xs{constructor(e,t,r,s){this.isReverse=s,this.nodeStack=[];let i=1;for(;!e.isEmpty();)if(i=t?r(e.key,t):1,t&&s&&(i*=-1),i<0)e=this.isReverse?e.left:e.right;else{if(i===0){this.nodeStack.push(e);break}this.nodeStack.push(e),e=this.isReverse?e.right:e.left}}getNext(){let e=this.nodeStack.pop();const t={key:e.key,value:e.value};if(this.isReverse)for(e=e.left;!e.isEmpty();)this.nodeStack.push(e),e=e.right;else for(e=e.right;!e.isEmpty();)this.nodeStack.push(e),e=e.left;return t}hasNext(){return this.nodeStack.length>0}peek(){if(this.nodeStack.length===0)return null;const e=this.nodeStack[this.nodeStack.length-1];return{key:e.key,value:e.value}}}class Re{constructor(e,t,r,s,i){this.key=e,this.value=t,this.color=r??Re.RED,this.left=s??Re.EMPTY,this.right=i??Re.EMPTY,this.size=this.left.size+1+this.right.size}copy(e,t,r,s,i){return new Re(e??this.key,t??this.value,r??this.color,s??this.left,i??this.right)}isEmpty(){return!1}inorderTraversal(e){return this.left.inorderTraversal(e)||e(this.key,this.value)||this.right.inorderTraversal(e)}reverseTraversal(e){return this.right.reverseTraversal(e)||e(this.key,this.value)||this.left.reverseTraversal(e)}min(){return this.left.isEmpty()?this:this.left.min()}minKey(){return this.min().key}maxKey(){return this.right.isEmpty()?this.key:this.right.maxKey()}insert(e,t,r){let s=this;const i=r(e,s.key);return s=i<0?s.copy(null,null,null,s.left.insert(e,t,r),null):i===0?s.copy(null,t,null,null,null):s.copy(null,null,null,null,s.right.insert(e,t,r)),s.fixUp()}removeMin(){if(this.left.isEmpty())return Re.EMPTY;let e=this;return e.left.isRed()||e.left.left.isRed()||(e=e.moveRedLeft()),e=e.copy(null,null,null,e.left.removeMin(),null),e.fixUp()}remove(e,t){let r,s=this;if(t(e,s.key)<0)s.left.isEmpty()||s.left.isRed()||s.left.left.isRed()||(s=s.moveRedLeft()),s=s.copy(null,null,null,s.left.remove(e,t),null);else{if(s.left.isRed()&&(s=s.rotateRight()),s.right.isEmpty()||s.right.isRed()||s.right.left.isRed()||(s=s.moveRedRight()),t(e,s.key)===0){if(s.right.isEmpty())return Re.EMPTY;r=s.right.min(),s=s.copy(r.key,r.value,null,null,s.right.removeMin())}s=s.copy(null,null,null,null,s.right.remove(e,t))}return s.fixUp()}isRed(){return this.color}fixUp(){let e=this;return e.right.isRed()&&!e.left.isRed()&&(e=e.rotateLeft()),e.left.isRed()&&e.left.left.isRed()&&(e=e.rotateRight()),e.left.isRed()&&e.right.isRed()&&(e=e.colorFlip()),e}moveRedLeft(){let e=this.colorFlip();return e.right.left.isRed()&&(e=e.copy(null,null,null,null,e.right.rotateRight()),e=e.rotateLeft(),e=e.colorFlip()),e}moveRedRight(){let e=this.colorFlip();return e.left.left.isRed()&&(e=e.rotateRight(),e=e.colorFlip()),e}rotateLeft(){const e=this.copy(null,null,Re.RED,null,this.right.left);return this.right.copy(null,null,this.color,e,null)}rotateRight(){const e=this.copy(null,null,Re.RED,this.left.right,null);return this.left.copy(null,null,this.color,null,e)}colorFlip(){const e=this.left.copy(null,null,!this.left.color,null,null),t=this.right.copy(null,null,!this.right.color,null,null);return this.copy(null,null,!this.color,e,t)}checkMaxDepth(){const e=this.check();return Math.pow(2,e)<=this.size+1}check(){if(this.isRed()&&this.left.isRed())throw q(43730,{key:this.key,value:this.value});if(this.right.isRed())throw q(14113,{key:this.key,value:this.value});const e=this.left.check();if(e!==this.right.check())throw q(27949);return e+(this.isRed()?0:1)}}Re.EMPTY=null,Re.RED=!0,Re.BLACK=!1;Re.EMPTY=new class{constructor(){this.size=0}get key(){throw q(57766)}get value(){throw q(16141)}get color(){throw q(16727)}get left(){throw q(29726)}get right(){throw q(36894)}copy(e,t,r,s,i){return this}insert(e,t,r){return new Re(e,t)}remove(e,t){return this}isEmpty(){return!0}inorderTraversal(e){return!1}reverseTraversal(e){return!1}minKey(){return null}maxKey(){return null}isRed(){return!1}checkMaxDepth(){return!0}check(){return 0}};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class pe{constructor(e){this.comparator=e,this.data=new oe(this.comparator)}has(e){return this.data.get(e)!==null}first(){return this.data.minKey()}last(){return this.data.maxKey()}get size(){return this.data.size}indexOf(e){return this.data.indexOf(e)}forEach(e){this.data.inorderTraversal(((t,r)=>(e(t),!1)))}forEachInRange(e,t){const r=this.data.getIteratorFrom(e[0]);for(;r.hasNext();){const s=r.getNext();if(this.comparator(s.key,e[1])>=0)return;t(s.key)}}forEachWhile(e,t){let r;for(r=t!==void 0?this.data.getIteratorFrom(t):this.data.getIterator();r.hasNext();)if(!e(r.getNext().key))return}firstAfterOrEqual(e){const t=this.data.getIteratorFrom(e);return t.hasNext()?t.getNext().key:null}getIterator(){return new rl(this.data.getIterator())}getIteratorFrom(e){return new rl(this.data.getIteratorFrom(e))}add(e){return this.copy(this.data.remove(e).insert(e,!0))}delete(e){return this.has(e)?this.copy(this.data.remove(e)):this}isEmpty(){return this.data.isEmpty()}unionWith(e){let t=this;return t.size<e.size&&(t=e,e=this),e.forEach((r=>{t=t.add(r)})),t}isEqual(e){if(!(e instanceof pe)||this.size!==e.size)return!1;const t=this.data.getIterator(),r=e.data.getIterator();for(;t.hasNext();){const s=t.getNext().key,i=r.getNext().key;if(this.comparator(s,i)!==0)return!1}return!0}toArray(){const e=[];return this.forEach((t=>{e.push(t)})),e}toString(){const e=[];return this.forEach((t=>e.push(t))),"SortedSet("+e.toString()+")"}copy(e){const t=new pe(this.comparator);return t.data=e,t}}class rl{constructor(e){this.iter=e}getNext(){return this.iter.getNext().key}hasNext(){return this.iter.hasNext()}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const S={OK:"ok",CANCELLED:"cancelled",UNKNOWN:"unknown",INVALID_ARGUMENT:"invalid-argument",DEADLINE_EXCEEDED:"deadline-exceeded",NOT_FOUND:"not-found",ALREADY_EXISTS:"already-exists",PERMISSION_DENIED:"permission-denied",UNAUTHENTICATED:"unauthenticated",RESOURCE_EXHAUSTED:"resource-exhausted",FAILED_PRECONDITION:"failed-precondition",ABORTED:"aborted",OUT_OF_RANGE:"out-of-range",UNIMPLEMENTED:"unimplemented",INTERNAL:"internal",UNAVAILABLE:"unavailable",DATA_LOSS:"data-loss"};class D extends kt{constructor(e,t){super(e,t),this.code=e,this.message=t,this.toString=()=>`${this.name}: [code=${this.code}]: ${this.message}`}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const er="__name__";class ut{constructor(e,t,r){t===void 0?t=0:t>e.length&&q(637,{offset:t,range:e.length}),r===void 0?r=e.length-t:r>e.length-t&&q(1746,{length:r,range:e.length-t}),this.segments=e,this.offset=t,this.len=r}get length(){return this.len}isEqual(e){return ut.comparator(this,e)===0}child(e){const t=this.segments.slice(this.offset,this.limit());return e instanceof ut?e.forEach((r=>{t.push(r)})):t.push(e),this.construct(t)}limit(){return this.offset+this.length}popFirst(e){return e=e===void 0?1:e,this.construct(this.segments,this.offset+e,this.length-e)}popLast(){return this.construct(this.segments,this.offset,this.length-1)}firstSegment(){return this.segments[this.offset]}lastSegment(){return this.get(this.length-1)}get(e){return this.segments[this.offset+e]}isEmpty(){return this.length===0}isPrefixOf(e){if(e.length<this.length)return!1;for(let t=0;t<this.length;t++)if(this.get(t)!==e.get(t))return!1;return!0}isImmediateParentOf(e){if(this.length+1!==e.length)return!1;for(let t=0;t<this.length;t++)if(this.get(t)!==e.get(t))return!1;return!0}forEach(e){for(let t=this.offset,r=this.limit();t<r;t++)e(this.segments[t])}toArray(){return this.segments.slice(this.offset,this.limit())}static comparator(e,t){const r=Math.min(e.length,t.length);for(let s=0;s<r;s++){const i=ut.compareSegments(e.get(s),t.get(s));if(i!==0)return i}return Q(e.length,t.length)}static compareSegments(e,t){const r=ut.isNumericId(e),s=ut.isNumericId(t);return r&&!s?-1:!r&&s?1:r&&s?ut.extractNumericId(e).compare(ut.extractNumericId(t)):Jr(e,t)}static isNumericId(e){return e.startsWith("__id")&&e.endsWith("__")}static extractNumericId(e){return Kt.fromString(e.substring(4,e.length-2))}}class ee extends ut{construct(e,t,r){return new ee(e,t,r)}canonicalString(){return this.toArray().join("/")}toString(){return this.canonicalString()}toStringWithLeadingSlash(){return`/${this.canonicalString()}`}toUriEncodedString(){return this.toArray().map(encodeURIComponent).join("/")}static fromString(...e){const t=[];for(const r of e){if(r.indexOf("//")>=0)throw new D(S.INVALID_ARGUMENT,`Invalid segment (${r}). Paths must not contain // in them.`);t.push(...r.split("/").filter((s=>s.length>0)))}return new ee(t)}static emptyPath(){return new ee([])}}const ty=/^[_a-zA-Z][_a-zA-Z0-9]*$/;let Ye=class qn extends ut{construct(e,t,r){return new qn(e,t,r)}static isValidIdentifier(e){return ty.test(e)}canonicalString(){return this.toArray().map((e=>(e=e.replace(/\\/g,"\\\\").replace(/`/g,"\\`"),qn.isValidIdentifier(e)||(e="`"+e+"`"),e))).join(".")}toString(){return this.canonicalString()}isKeyField(){return this.length===1&&this.get(0)===er}static keyField(){return new qn([er])}static fromServerFormat(e){const t=[];let r="",s=0;const i=()=>{if(r.length===0)throw new D(S.INVALID_ARGUMENT,`Invalid field path (${e}). Paths must not be empty, begin with '.', end with '.', or contain '..'`);t.push(r),r=""};let a=!1;for(;s<e.length;){const c=e[s];if(c==="\\"){if(s+1===e.length)throw new D(S.INVALID_ARGUMENT,"Path has trailing escape character: "+e);const l=e[s+1];if(l!=="\\"&&l!=="."&&l!=="`")throw new D(S.INVALID_ARGUMENT,"Path has invalid escape sequence: "+e);r+=l,s+=2}else c==="`"?(a=!a,s++):c!=="."||a?(r+=c,s++):(i(),s++)}if(i(),a)throw new D(S.INVALID_ARGUMENT,"Unterminated ` in path: "+e);return new qn(t)}static emptyPath(){return new qn([])}};/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class rt{constructor(e){this.fields=e,e.sort(Ye.comparator)}static empty(){return new rt([])}unionWith(e){let t=new pe(Ye.comparator);for(const r of this.fields)t=t.add(r);for(const r of e)t=t.add(r);return new rt(t.toArray())}covers(e){for(const t of this.fields)if(t.isPrefixOf(e))return!0;return!1}isEqual(e){return Zn(this.fields,e.fields,((t,r)=>t.isEqual(r)))}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Sn(n){let e=0;for(const t in n)Object.prototype.hasOwnProperty.call(n,t)&&e++;return e}function xn(n,e){for(const t in n)Object.prototype.hasOwnProperty.call(n,t)&&e(t,n[t])}function ny(n,e){const t=[];for(const r in n)Object.prototype.hasOwnProperty.call(n,r)&&t.push(e(n[r],r,n));return t}function Xh(n){for(const e in n)if(Object.prototype.hasOwnProperty.call(n,e))return!1;return!0}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class F{constructor(e){this.path=e}static fromPath(e){return new F(ee.fromString(e))}static fromName(e){return new F(ee.fromString(e).popFirst(5))}static empty(){return new F(ee.emptyPath())}get collectionGroup(){return this.path.popLast().lastSegment()}hasCollectionId(e){return this.path.length>=2&&this.path.get(this.path.length-2)===e}getCollectionGroup(){return this.path.get(this.path.length-2)}getCollectionPath(){return this.path.popLast()}isEqual(e){return e!==null&&ee.comparator(this.path,e.path)===0}toString(){return this.path.toString()}static comparator(e,t){return ee.comparator(e.path,t.path)}static isDocumentKey(e){return e.length%2==0}static fromSegments(e){return new F(new ee(e.slice()))}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Zh(n,e,t){if(!t)throw new D(S.INVALID_ARGUMENT,`Function ${n}() cannot be called with an empty ${e}.`)}function ry(n,e,t,r){if(e===!0&&r===!0)throw new D(S.INVALID_ARGUMENT,`${n} and ${t} cannot be used together.`)}function sl(n){if(!F.isDocumentKey(n))throw new D(S.INVALID_ARGUMENT,`Invalid document reference. Document references must have an even number of segments, but ${n} has ${n.length}.`)}function il(n){if(F.isDocumentKey(n))throw new D(S.INVALID_ARGUMENT,`Invalid collection reference. Collection references must have an odd number of segments, but ${n} has ${n.length}.`)}function As(n){return typeof n=="object"&&n!==null&&(Object.getPrototypeOf(n)===Object.prototype||Object.getPrototypeOf(n)===null)}function zi(n){if(n===void 0)return"undefined";if(n===null)return"null";if(typeof n=="string")return n.length>20&&(n=`${n.substring(0,20)}...`),JSON.stringify(n);if(typeof n=="number"||typeof n=="boolean")return""+n;if(typeof n=="object"){if(n instanceof Array)return"an array";{const e=(function(r){return r.constructor?r.constructor.name:null})(n);return e?`a custom ${e} object`:"an object"}}return typeof n=="function"?"a function":q(12329,{type:typeof n})}function Rt(n,e){if("_delegate"in n&&(n=n._delegate),!(n instanceof e)){if(e.name===n.constructor.name)throw new D(S.INVALID_ARGUMENT,"Type does not match the expected instance. Did you pass a reference from a different Firestore SDK?");{const t=zi(n);throw new D(S.INVALID_ARGUMENT,`Expected type '${e.name}', but it was: ${t}`)}}return n}/**
 * @license
 * Copyright 2025 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function he(n,e){const t={typeString:n};return e&&(t.value=e),t}function bs(n,e){if(!As(n))throw new D(S.INVALID_ARGUMENT,"JSON must be an object");let t;for(const r in e)if(e[r]){const s=e[r].typeString,i="value"in e[r]?{value:e[r].value}:void 0,a=e[r].optional;if(!(r in n)){if(a)continue;t=`JSON missing required field: '${r}'`;break}const c=n[r];if(s&&typeof c!==s){t=`JSON field '${r}' must be a ${s}.`;break}if(i!==void 0&&c!==i.value){t=`Expected '${r}' field to equal '${i.value}'`;break}}if(t)throw new D(S.INVALID_ARGUMENT,t);return!0}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const ol=-62135596800,al=1e6;class te{static now(){return te.fromMillis(Date.now())}static fromDate(e){return te.fromMillis(e.getTime())}static fromMillis(e){const t=Math.floor(e/1e3),r=Math.floor((e-1e3*t)*al);return new te(t,r)}static fromInstant(e){if(!e||typeof e.t!="bigint")throw new D(S.INVALID_ARGUMENT,"Invalid Temporal.Instant object provided.");return te._fromEpochNanoseconds(e.t)}static _fromEpochNanoseconds(e){let t,r;if(e>=0n)t=Number(e/1000000000n),r=Number(e%1000000000n);else{const s=e%1000000000n;s===0n?(t=Number(e/1000000000n),r=0):(t=Number(e/1000000000n-1n),r=Number(s+1000000000n))}return new te(t,r)}constructor(e,t){if(this.seconds=e,this.nanoseconds=t,t<0)throw new D(S.INVALID_ARGUMENT,"Timestamp nanoseconds out of range: "+t);if(t>=1e9)throw new D(S.INVALID_ARGUMENT,"Timestamp nanoseconds out of range: "+t);if(e<ol)throw new D(S.INVALID_ARGUMENT,"Timestamp seconds out of range: "+e);if(e>=253402300800)throw new D(S.INVALID_ARGUMENT,"Timestamp seconds out of range: "+e)}toDate(){return new Date(this.toMillis())}toMillis(){return 1e3*this.seconds+this.nanoseconds/al}toInstant(){if(typeof Temporal>"u"||!Temporal.Instant)throw new D(S.FAILED_PRECONDITION,"The Temporal object is not available in the current environment.");const e=1000000000n*BigInt(this.seconds)+BigInt(this.nanoseconds);return Temporal.Instant.__PRIVATE_fromEpochNanoseconds(e)}_compareTo(e){return this.seconds===e.seconds?Q(this.nanoseconds,e.nanoseconds):Q(this.seconds,e.seconds)}isEqual(e){return e.seconds===this.seconds&&e.nanoseconds===this.nanoseconds}toString(){return"Timestamp(seconds="+this.seconds+", nanoseconds="+this.nanoseconds+")"}toJSON(){return{type:te._jsonSchemaVersion,seconds:this.seconds,nanoseconds:this.nanoseconds}}static fromJSON(e){if(bs(e,te._jsonSchema))return new te(e.seconds,e.nanoseconds)}valueOf(){const e=this.seconds-ol;return String(e).padStart(12,"0")+"."+String(this.nanoseconds).padStart(9,"0")}}te._jsonSchemaVersion="firestore/timestamp/1.0",te._jsonSchema={type:he("string",te._jsonSchemaVersion),seconds:he("number"),nanoseconds:he("number")};/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ef extends Error{constructor(){super(...arguments),this.name="Base64DecodeError"}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ae{constructor(e){this.binaryString=e}static fromBase64String(e){const t=(function(s){try{return atob(s)}catch(i){throw typeof DOMException<"u"&&i instanceof DOMException?new ef("Invalid base64 string: "+i):i}})(e);return new ae(t)}static fromUint8Array(e){const t=(function(s){let i="";for(let a=0;a<s.length;++a)i+=String.fromCharCode(s[a]);return i})(e);return new ae(t)}[Symbol.iterator](){let e=0;return{next:()=>e<this.binaryString.length?{value:this.binaryString.charCodeAt(e++),done:!1}:{value:void 0,done:!0}}}toBase64(){return(function(t){return btoa(t)})(this.binaryString)}toUint8Array(){return(function(t){const r=new Uint8Array(t.length);for(let s=0;s<t.length;s++)r[s]=t.charCodeAt(s);return r})(this.binaryString)}approximateByteSize(){return 2*this.binaryString.length}compareTo(e){return Q(this.binaryString,e.binaryString)}isEqual(e){return this.binaryString===e.binaryString}}ae.EMPTY_BYTE_STRING=new ae("");const sy=new RegExp(/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.(\d+))?Z$/);function Zt(n){if(U(!!n,39018),typeof n=="string"){let e=0;const t=sy.exec(n);if(U(!!t,46558,{timestamp:n}),t[1]){let s=t[1];s=(s+"000000000").substr(0,9),e=Number(s)}const r=new Date(n);return{seconds:Math.floor(r.getTime()/1e3),nanos:e}}return{seconds:ue(n.seconds),nanos:ue(n.nanos)}}function ue(n){return typeof n=="number"?n:typeof n=="string"?Number(n):0}function Cn(n){return typeof n=="string"?ae.fromBase64String(n):ae.fromUint8Array(n)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const tf="server_timestamp",nf="__type__",rf="__previous_value__",sf="__local_write_time__";function Sa(n){var t,r;return((r=(((t=n==null?void 0:n.mapValue)==null?void 0:t.fields)||{})[nf])==null?void 0:r.stringValue)===tf}function Rs(n){const e=n.mapValue.fields[rf];return Sa(e)?Rs(e):e}function tr(n){const e=Zt(n.mapValue.fields[sf].timestampValue);return new te(e.seconds,e.nanos)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class iy{constructor(e,t,r,s,i,a,c,l,f,d,m,I,V){this.databaseId=e,this.appId=t,this.persistenceKey=r,this.host=s,this.ssl=i,this.forceLongPolling=a,this.autoDetectLongPolling=c,this.longPollingOptions=l,this.useFetchStreams=f,this.isUsingEmulator=d,this.apiKey=m,this._customHeaders=I,this.grpcFlowControlWindow=V}}const vi="(default)";class Xr{constructor(e,t){this.projectId=e,this.database=t||vi}static empty(){return new Xr("","")}get isDefaultDatabase(){return this.database===vi}isEqual(e){return e instanceof Xr&&e.projectId===this.projectId&&e.database===this.database}}function oy(n,e){if(!Object.prototype.hasOwnProperty.apply(n.options,["projectId"]))throw new D(S.INVALID_ARGUMENT,'"projectId" not provided in firebase.initializeApp.');return new Xr(n.options.projectId,e)}/**
 * Copyright 2021 M.Vokhmentsev
 *
 * @license
 * Copyright 2025 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ${constructor(){this.exponent=0,this.i=0n,this.o=0n,this.u=new Array(4).fill(0n),this.l=new Array(6).fill(0n),this.h=new Array(6).fill(0n),this.T=new Array(6).fill(0n),this.P=new Array(12).fill(0n)}static I(e,t){let r=new $;return r.parse(e,t),r}parse(e,t){t+=e.length-1,this.exponent=0,this.i=0n,this.o=0n;let r=this.T,s=this.R(e,r);if(s==0&&this.isEmpty(r)||(t+=s)<$.A)return;if(t>$.V)return void(this.exponent=Number($.m));let i=this.p(t,r);this.S(t,i,r)}R(e,t){for(let i=0;i<6;i++)t[i]=0n;let r=0;for(;r<e.length&&e[r]==0;)r+=1;if(r==e.length)return 0;let s=-r;if(e.length-r>$.v){let i=e[$.v]>=5,a=new Array($.v).fill(0);for(let c=0;c<$.v;c++)a[c]=e[c+r];i&&(s+=this.D(a)),e=a,r=0}for(let i=e.length-1;i>=r;i--)t[0]|=BigInt(e[i])<<32n,this.C(t);return s}C(e){let t=e.length;for(let r=0;r<t;r++){let s=e[r]%10n;e[r]=e[r]/10n,r+1<t&&(e[r+1]+=s<<32n)}}isEmpty(e){for(let t=0;t<e.length;t++)if(e[t]!=0n)return!1;return!0}D(e){for(let t=e.length-1;t>=0;t--){if(e[t]!=9)return e[t]=e[t]+1,0;e[t]=0}return e[0]=1,1}p(e,t){let r=t[0]<<31n|t[1]>>1n,s=Number(r)/$.F;return Math.floor(Number(e)*$.O+this.log2(s))}log2(e){return $.M*Math.log(e)}S(e,t,r){let s=this.u;this.N(-t,s);let i=this.P;this.B(r,s,i),this.L(i),BigInt(s[0])!=BigInt(-e)&&this.L(i),t+=this.$(i),(t+=$.U)<=0||(t+=this.k(i),BigInt(t)>=$.m?this.exponent=Number($.m):(this.exponent=Number(t),this.i=(i[0]<<32n)+i[1]&0xffffffffffffffffn,this.o=(i[2]<<32n)+i[3]&0xffffffffffffffffn))}N(e,t){if(e==0)return void this.q($.K[0],t);let r=$.K;e<0&&(e=-e,r=$.W);let s=$.G,i=32,a=!0;for(;e>0;)e>=s&&(a?(this.q(r[i],t),a=!1):this.j(t,r[i],t),e-=s),i-=1,s*=.5}q(e,t){for(let r=0;r<t.length;r++)t[r]=e[r]}j(e,t,r){this.H(e,t,this.P);let s=this.J(this.P);this.Y(this.P,r),r[0]=e[0]+t[0]+BigInt(s)}H(e,t,r){for(let s=0;s<r.length;s++)r[s]=0n;this.Z(e,this.l),this.Z(t,this.h);for(let s=5;s>=0;s--)for(let i=5;i>=0;i--){let a=this.l[s]*this.h[i];r[i+s+1]=r[i+s+1]+(a&$.X)&0xffffffffffffffffn,r[i+s]=r[i+s]+(a>>32n)&0xffffffffffffffffn}for(let s=11;s>=1;s--)r[s-1]=r[s-1]+(r[s]>>32n)&0xffffffffffffffffn,r[s]&=$.X}J(e){let t=0;for(;this.ee(e);)this.L(e),t-=1;return t}ee(e){if(e[0]<0x19999999n)return!0;if(e[0]>0x19999999n)return!1;for(let t=1;t<e.length;t++){if(e[t]<0x99999999n)return!0;if(e[t]>0x99999999n)return!1}return!1}B(e,t,r){for(let a=0;a<r.length;a++)r[a]=0n;let s=this.h;this.Z(t,s);let i=e.length;for(let a=i-1;a>=0;a--)for(let c=i-1;c>=0;c--){let l=e[a]*s[c];r[c+a+1]=r[c+a+1]+(l&$.X)&0xffffffffffffffffn,r[c+a]=r[c+a]+(l>>32n)&0xffffffffffffffffn}for(let a=11;a>=1;a--)r[a-1]=r[a-1]+(r[a]>>32n)&0xffffffffffffffffn,r[a]&=$.X}L(e){let t=e.length-1;e[0]&=$.X,e[t]*=10n;for(let r=t-1;r>=0;r--)e[r]=10n*e[r]+(e[r+1]>>32n)&0xffffffffffffffffn,e[r+1]&=$.X}$(e){let t=31-$.te(e[0]);return t!=0&&this.ne(e,t),t}k(e){return this.re(e,5,100n),this.re(e,4,0x80000000n),(e[0]&$.ie<<1n)!=0n?(this.ne(e,1),1):0}Y(e,t){t[1]=(e[0]<<32n)+e[1],t[2]=(e[2]<<32n)+e[3],t[3]=(e[4]<<32n)+e[5]}Z(e,t){t[0]=e[1]>>32n,t[1]=e[1]&$.X,t[2]=e[2]>>32n,t[3]=e[2]&$.X,t[4]=e[3]>>32n,t[5]=e[3]&$.X}ne(e,t){let r=e.length-1,s=BigInt(32-Math.abs(t));if(t>0){let i=BigInt(t);for(let a=r+1-1;a>=1;a--)e[a]=e[a]>>i|e[a-1]<<s&$.X;e[0]=e[0]>>i}else if(t<0){let i=BigInt(-t);e[0]=0xffffffffffffffffn&(e[0]<<i|e[1]>>s);for(let a=1;a<r;a++)e[a]=0xffffffffffffffffn&(e[a]<<i&$.X|e[a+1]>>s);e[r]=e[r]<<i&$.X}}re(e,t,r){let s=t;e[s]=e[s]+r&0xffffffffffffffffn;for(let i=s+1-1;i>=1&&(e[i]&$.ie)!=0n;i--)e[i]&=$.X,e[i-1]+=1n}static te(e){let t=Number(e>>32n);return t==0?32+Math.clz32(Number(BigInt.asUintN(32,e))):Math.clz32(t)}}/**
 * @license
 * Copyright 2025 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */var Te,Gn,Yo,ui,li,Mr;$.v=59,$.V=646456993,$.A=-646457032,$.F=0xccccccccccccd00,$.se=0x8000000000000000n,$.G=2147483648,$.X=0x00000000ffffffffn,$.ie=0xffffffff00000000n,$.O=Math.log(10)/Math.log(2),$.M=1/Math.log(2),$.U=2147483647,$.m=0xffffffffn,$.K=[[1n,0x1999999999999999n,0x9999999999999999n,0x999999999999999an],[1n,0x3333333333333333n,0x3333333333333333n,0x3333333333333334n],[1n,0x6666666666666666n,0x6666666666666666n,0x6666666666666667n],[2n,0x28f5c28f5c28f5c2n,0x8f5c28f5c28f5c28n,0xf5c28f5c28f5c290n],[3n,0x4189374bc6a7ef9dn,0xb22d0e5604189374n,0xbc6a7ef9db22d0e6n],[5n,0xa7c5ac471b478423n,0x0fcf80dc33721d53n,0xcddd6e04c0592104n],[10n,0x6df37f675ef6eadfn,0x5ab9a2072d44268dn,0x97df837e6748956en],[20n,0x2f394219248446ban,0xa23d2ec729af3d61n,0x0607aa0167dd94cbn],[39n,0x571cbec554b60dbbn,0xd5f64baf0506840dn,0x451db70d5904029bn],[78n,0x1da48ce468e7c702n,0x6520247d3556476dn,0x1469caf6db224cfan],[155n,0x2252f0e5b39769dcn,0x9ae2eea30ca3ade0n,0xeeaa3c08dfe84e30n],[309n,0x2e055c9a3f6ba793n,0x16583a816eb60a59n,0x22c4b0826cf1ebf7n],[617n,0x52bb45e9cf23f17fn,0x7688c07606e50364n,0xb34479aa9d449a57n],[1234n,0x1abc81c8ff5f846cn,0x8f5e3c9853e38c97n,0x45060097f3bf9296n],[2467n,0x1bec53b510daa7b4n,0x48369ed77dbb0eb1n,0x3b05587b2187b41en],[4933n,0x1e75063a5ba91326n,0x8abfb8e460016ae3n,0x28008702d29e8a3cn],[9865n,0x243c5d8bb5c5fa55n,0x40c6d248c5881915n,0x4c0fd99fd5befc22n],[19729n,0x334a5570c3f4ef3cn,0xa13c36c43f979c90n,0xda7ac473555fb7a8n],[39457n,0x66c304445dd98f3bn,0xa8c293a20e47a41bn,0x4c5b03dc12604964n],[78914n,0x293ffbf5fb028cc4n,0x89d3e5ff44238406n,0x369a339e1bfe8c9bn],[157827n,0x427792fbb68e5d20n,0x7b297cd9fc154b62n,0xf09142114aa9a20cn],[315653n,0xac92bc65ad5c08fcn,0x00beeb115a566c19n,0x4ba882d8a4622437n],[631306n,0x745581440f92e80en,0x4da822cf7f896f41n,0x509d598678164ecdn],[1262612n,0x34dd99b4c69523a5n,0x64bc2e8f0d8b1044n,0xb03b1c96da5dd349n],[2525223n,0x6d2bbea9d6d25a08n,0xa0a4606a88e96b70n,0x182063bbc2fe8520n],[5050446n,0x2e8e47d63bfdd6e3n,0x2b55fa8976eaa3e9n,0x1a6b9d3086412a73n],[10100891n,0x54aa68efa1d719dfn,0xd8505806612c5c8fn,0xad068837fee8b43an],[20201782n,0x1c00464ccb7bae77n,0x9e3877784c77982cn,0xd94af3b61717404fn],[40403563n,0x1ea099c8be2b6cd0n,0x8bfb6d539fa50466n,0x6d3bc37e69a84218n],[80807125n,0x24a457f466ce8d18n,0xf2c8f3b81bc6bb59n,0xa78c757692e02d49n],[161614249n,0x347256677aba6b53n,0x3fbf90d30611a67cn,0x1e039d87e0bdb32bn],[323228497n,0x6b727daf0fd3432an,0x71f71121f9e4200fn,0x8fcd9942d486c10cn],[646456994n,0x2d18e84484d91f78n,0x4079bfe7829dec6fn,0x21551643e365abc6n]],$.W=[[1n,0x1999999999999999n,0x9999999999999999n,0x999999999999999an],[0n,0x8000000000000000n,0x0000000000000000n,0x0000000000000000n],[0n,0x4000000000000000n,0x0000000000000000n,0x0000000000000001n],[-1n,0xa000000000000000n,0x0000000000000000n,0x0000000000000000n],[-2n,0x6400000000000000n,0x0000000000000000n,0x0000000000000000n],[-4n,0x2710000000000000n,0x0000000000000000n,0x0000000000000001n],[-9n,0x3b9aca0000000000n,0x0000000000000000n,0x0000000000000001n],[-19n,0x8ac7230489e80000n,0x0000000000000000n,0x0000000000000000n],[-38n,0x4b3b4ca85a86c47an,0x098a224000000000n,0x0000000000000001n],[-77n,0xdd15fe86affad912n,0x49ef0eb713f39eben,0xaa987b6e6fd2a002n],[-154n,0xbeeefb584aff8603n,0xaafb550ffacfd8fan,0x5ca47e4f88d45371n],[-308n,0x8e679c2f5e44ff8fn,0x570f09eaa7ea7648n,0x5961db50c6d2b888n],[-616n,0x4f371b3399fc2ab0n,0x8170041c9feb05aan,0xc7c343447c75bcf6n],[-1233n,0xf51e928179013fd3n,0xde4bd12cde4d985cn,0x4a573ca6f94bff14n],[-2466n,0xeab388127bccaff7n,0x1667639142b9fbaen,0x775ec9995e1039fbn],[-4932n,0xd72cb2a95c7ef6ccn,0xe81bf1e825ba7515n,0xc2feb521d6cb5dcdn],[-9864n,0xb4dc1be6604502dcn,0xd491079b8eef6535n,0x578d3965d24de84dn],[-19728n,0x7fc6447bee60ea43n,0x2548da5c8b125b27n,0x5f42d1142f41d349n],[-39456n,0x3fc65180f88af8fbn,0x6a6915f383349413n,0x063c3708b6ceb291n],[-78913n,0x9ee0197c8dcd55bfn,0x2b2b9b942c38f4a2n,0x0f8ba634e9c706aen],[-157826n,0x629963a25b8b2d79n,0xd00b9d2286f70876n,0xe97004700c3644fcn],[-315652n,0x25f9cc308ceef4f3n,0x40f19543911a4546n,0xa2cd389452cfc366n],[-631305n,0x385597b0d47e76b8n,0x1b9f67e103bf2329n,0xc3119848595985f7n],[-1262611n,0x7bf795d276c12f66n,0x66a61d62a446659an,0xa1a4d73bebf093d5n],[-2525222n,0x3c07d96ab1ed7799n,0xcb7355c22cc05ac0n,0x4ffc0ab73b1f6a49n],[-5050445n,0x8cc4cd8c3edefb9an,0x6c8ff86a90a97e0cn,0x166cfddbf98b71bfn],[-10100890n,0x4d67d81cc88e1228n,0x1d7cfb06666b79b3n,0x7b916728aaa4e70dn],[-20201781n,0xea0c55494e7a552dn,0xb88cb9484bb86c61n,0x8d44893c610bb7dfn],[-40403562n,0xd5fa8c821ec0c24an,0xa80e46e764e0f8b0n,0xa7276bfa432fac7en],[-80807124n,0xb2dae307426f6791n,0xc970b82f58b12918n,0x0472592f7f39190en],[-161614248n,0x7cf51edd8a15f1c9n,0x656dab3498f8e697n,0x12daa2a80e53c807n],[-323228496n,0x3cfe609ab5883c50n,0xbec8b5d22b198871n,0xe18477703b4622b4n],[-646456993n,0x9152447b9d7cda9an,0x3b4d3f6110d77aadn,0xfa81bad1c394adb4n]];class B{constructor(e,t,r,s){this.negative=e,this._e=t,this.i=r,this.o=s}exponent(){return this._e-$.U}oe(){return this._e===0&&this.i===0n&&this.o===0n}ae(){return this._e===be(B,Te,"f",Gn)&&this.i===0n&&this.o===0n}isNaN(){return this._e===be(B,Te,"f",Gn)&&!(this.i===0n&&this.o===0n)}compareTo(e){if(this.isNaN())return e.isNaN()?0:1;if(e.isNaN())return-1;let t,r;if(this.negative){if(!e.negative)return-1;t=1,r=-1}else{if(e.negative)return 1;t=-1,r=1}return this._e<e._e?t:this._e>e._e?r:this.i<e.i?t:this.i>e.i?r:this.o<e.o?t:this.o>e.o?r:0}debug(){return(this.negative?"+":"-")+be(B,Te,"m",Yo).call(B,this.i)+be(B,Te,"m",Yo).call(B,this.o)+"*2^"+this.exponent()}static fromNumber(e){if(isNaN(e))return B.NaN;if(!isFinite(e))return e<0?B.ue:B.ce;if(e===0)return Math.sign(1/e)>0?B.le:B.Ee;const t=new DataView(new ArrayBuffer(8));t.setFloat64(0,e);const r=t.getBigUint64(0);let s=BigInt.asUintN(64,r<<12n),i=2047&Number(r>>52n);if(i===0){const a=$.te(s);s=a<63?s<<BigInt(a+1):0n,i=-a}return new B(e<0,be(B,Te,"m",Mr).call(B,i-1023),s,0n)}static fromString(e){if(e==="NaN")return B.NaN;if(e==="-Infinity")return B.ue;if(e==="Infinity"||e==="+Infinity")return B.ce;const t=new Array(e.length).fill(0);let r=0,s=0,i=0,a=!1;for(e[r]==="-"?(a=!0,r++):e[r]==="+"&&r++;be(B,Te,"m",ui).call(B,e,r);)t[s++]=be(B,Te,"m",li).call(B,e,r++);if(e[r]==="."){const l=++r;for(;be(B,Te,"m",ui).call(B,e,r);)t[s++]=be(B,Te,"m",li).call(B,e,r++);i=l-r}if(e[r]==="e"||e[r]==="E"){let l=0;r++;let f=1;e[r]==="-"?(f=-1,r++):e[r]==="+"&&r++;const d=r;for(;be(B,Te,"m",ui).call(B,e,r);)if(l=10*l+be(B,Te,"m",li).call(B,e,r++),r-d>9)throw new Error("Exponent too large "+e);if(r===d)throw new Error("Invalid number "+e);i+=l*f}if(s===0||r!==e.length)throw new Error("Invalid number "+e);const c=$.I(t.slice(0,s),i);return new B(a,c.exponent,c.i,c.o)}}Te=B,Yo=function(e){return e.toString(16).padStart(16,"0")},ui=function(e,t){const r=e.codePointAt(t);return r!==void 0&&r>=48&&r<=57},li=function(e,t){return e.codePointAt(t)-48},Mr=function(e){return e+$.U},Gn={value:Number($.m)},B.le=new B(!1,0,0n,0n),B.Ee=new B(!0,0,0n,0n),B.NaN=new B(!1,be(B,Te,"f",Gn),1n<<63n,0n),B.ue=new B(!0,be(B,Te,"f",Gn),0n,0n),B.ce=new B(!1,be(B,Te,"f",Gn),0n,0n),new B(!0,be(B,Te,"m",Mr).call(B,63),0n,0n),new B(!1,be(B,Te,"m",Mr).call(B,0),0n,0n),new B(!0,be(B,Te,"m",Mr).call(B,0),0n,0n);/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Ca=-1;function Gi(n){return n==null}function Zr(n){return n===0&&1/n==-1/0}function ay(n){return typeof n=="number"&&Number.isInteger(n)&&!Zr(n)&&n<=Number.MAX_SAFE_INTEGER&&n>=Number.MIN_SAFE_INTEGER}function cy(n){return typeof n=="string"}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const xa="__type__",Na="__vector__",es="value",uy="server_timestamp",of="__min__",ka="__max__",Wt="__regex__",Ai="pattern",bi="options",ts="__oid__",Nn="__int__",en="__decimal128__",En="__request_timestamp__",Ri="seconds",Pi="increment",Wi="__binary__",nr={nullValue:"NULL_VALUE"},Zs={mapValue:{}};var re,Xe;(Xe=re||(re={})).he="regexValue",Xe.Te="bsonObjectIdValue",Xe.Pe="int32Value",Xe.Ie="decimal128Value",Xe.Re="bsonTimestampValue",Xe.Ae="bsonBinaryValue",Xe.Ve="minKeyValue",Xe.de="maxKeyValue",Xe.fe="maxValue",Xe.me="vectorValue",Xe.pe="serverTimestampValue",Xe.ge="regularMapValue";const cl={[Na]:re.me,[ka]:re.fe,[uy]:re.pe},af={[Wt]:re.he,[ts]:re.Te,[Nn]:re.Pe,[en]:re.Ie,[En]:re.Re,[Wi]:re.Ae,[of]:re.Ve,[ka]:re.de},ly=new Set(Object.values(af)),je={booleanValue:!0},ve={booleanValue:!1};function me(n){if("nullValue"in n)return 0;if("booleanValue"in n)return 2;if("integerValue"in n||"doubleValue"in n)return 3;if("timestampValue"in n)return 4;if("stringValue"in n)return 7;if("bytesValue"in n)return 8;if("referenceValue"in n)return 9;if("geoPointValue"in n)return 11;if("arrayValue"in n)return 13;if(!("mapValue"in n))return q(28295,{value:n});switch(pf(n)){case re.pe:return 6;case re.fe:return 9007199254740991;case re.me:return 14;case re.he:return 12;case re.Te:return 10;case re.Pe:case re.Ie:return 3;case re.Re:return 5;case re.Ae:return 8;case re.Ve:return 1;case re.de:return 16;default:return 15}}function Ze(n,e,t){if(n===e)return!0;const r=me(n);if(r!==me(e))return!1;switch(r){case 0:case 9007199254740991:case 16:case 1:return!0;case 2:return n.booleanValue===e.booleanValue;case 6:return tr(n).isEqual(tr(e));case 4:return(function(i,a){if(typeof i.timestampValue=="string"&&typeof a.timestampValue=="string"&&i.timestampValue.length===a.timestampValue.length)return i.timestampValue===a.timestampValue;const c=Zt(i.timestampValue),l=Zt(a.timestampValue);return c.seconds===l.seconds&&c.nanos===l.nanos})(n,e);case 7:return n.stringValue===e.stringValue;case 8:return(function(i,a){return hf(i,a)===0})(n,e);case 9:return n.referenceValue===e.referenceValue;case 11:return(function(i,a){return ue(i.geoPointValue.latitude)===ue(a.geoPointValue.latitude)&&ue(i.geoPointValue.longitude)===ue(a.geoPointValue.longitude)})(n,e);case 3:return(function(i,a,c){if(et(i)&&et(a))return uf(i,a)===0;if("integerValue"in i&&"integerValue"in a||tn(i)&&tn(a))return rs(i)===rs(a);let l,f;if("doubleValue"in i&&"doubleValue"in a)l=ue(i.doubleValue),f=ue(a.doubleValue);else{if(!(c!=null&&c.ye))return!1;l=ue(i.integerValue??i.doubleValue),f=ue(a.integerValue??a.doubleValue)}return l===f?!!(c!=null&&c.we)||Zr(l)===Zr(f):!!(c===void 0||c.be)&&isNaN(l)&&isNaN(f)})(n,e,t);case 13:return Zn(n.arrayValue.values||[],e.arrayValue.values||[],((s,i)=>Ze(s,i,t)));case 14:case 15:return(function(i,a,c){const l=i.mapValue.fields||{},f=a.mapValue.fields||{};if(Sn(l)!==Sn(f))return!1;for(const d in l)if(l.hasOwnProperty(d)&&(f[d]===void 0||!Ze(l[d],f[d],c)))return!1;return!0})(n,e,t);case 5:return lf(n,e)===0;case 12:return ff(n,e)===0;case 10:return df(n,e)===0;default:return q(52216,{left:n})}}function ns(n,e){return(n.values||[]).find((t=>Ze(t,e)))!==void 0}function ze(n,e){if(n===e)return 0;const t=me(n),r=me(e);if(t!==r)return Q(t,r);switch(t){case 0:case 1:case 16:case 9007199254740991:return 0;case 2:return Q(n.booleanValue,e.booleanValue);case 3:return ss(n,e);case 4:return ll(n.timestampValue,e.timestampValue);case 6:return ll(tr(n),tr(e));case 7:return Jr(n.stringValue,e.stringValue);case 8:return hf(n,e);case 9:return(function(i,a){const c=i.split("/"),l=a.split("/");for(let f=0;f<c.length&&f<l.length;f++){const d=Q(c[f],l[f]);if(d!==0)return d}return Q(c.length,l.length)})(n.referenceValue,e.referenceValue);case 11:return(function(i,a){const c=Q(ue(i.latitude),ue(a.latitude));return c!==0?c:Q(ue(i.longitude),ue(a.longitude))})(n.geoPointValue,e.geoPointValue);case 13:return hl(n.arrayValue,e.arrayValue);case 14:return(function(i,a){var I,V,x,M;const c=i.fields||{},l=a.fields||{},f=(I=c[es])==null?void 0:I.arrayValue,d=(V=l[es])==null?void 0:V.arrayValue,m=Q(((x=f==null?void 0:f.values)==null?void 0:x.length)||0,((M=d==null?void 0:d.values)==null?void 0:M.length)||0);return m!==0?m:hl(f,d)})(n.mapValue,e.mapValue);case 15:return(function(i,a){if(i===Zs.mapValue&&a===Zs.mapValue)return 0;if(i===Zs.mapValue)return 1;if(a===Zs.mapValue)return-1;const c=i.fields||{},l=Object.keys(c),f=a.fields||{},d=Object.keys(f);l.sort(),d.sort();for(let m=0;m<l.length&&m<d.length;++m){const I=Jr(l[m],d[m]);if(I!==0)return I;const V=ze(c[l[m]],f[d[m]]);if(V!==0)return V}return Q(l.length,d.length)})(n.mapValue,e.mapValue);case 5:return lf(n,e);case 12:return ff(n,e);case 10:return df(n,e);default:throw q(23264,{Se:t})}}function rs(n){let e;return e=tn(n)?n.mapValue.fields[Nn].integerValue:n.integerValue||n.doubleValue,ue(e)}function cf(n){return n.mapValue.fields[en].stringValue}function ss(n,e){if(et(n)||et(e))return uf(n,e);const t=rs(n),r=rs(e);return isNaN(t)?isNaN(r)?0:-1:isNaN(r)?1:Q(t,r)}function uf(n,e){const t=ul(n),r=ul(e);return t.oe()&&r.oe()?0:t.isNaN()?r.isNaN()?0:-1:r.isNaN()?1:t.compareTo(r)}function ul(n){return et(n)?B.fromString(cf(n)):B.fromNumber(rs(n))}function ll(n,e){if(typeof n=="string"&&typeof e=="string"&&n.length===e.length)return Q(n,e);const t=Zt(n),r=Zt(e),s=Q(t.seconds,r.seconds);return s!==0?s:Q(t.nanos,r.nanos)}function hl(n,e){const t=n.values||[],r=e.values||[];for(let s=0;s<t.length&&s<r.length;++s){const i=ze(t[s],r[s]);if(i!==void 0&&i!==0)return i}return Q(t.length,r.length)}function lf(n,e){var c,l,f,d,m,I,V,x,M,O,W,J;const t=(f=(l=(c=n.mapValue.fields)==null?void 0:c[En].mapValue)==null?void 0:l.fields)==null?void 0:f[Ri],r=(I=(m=(d=e.mapValue.fields)==null?void 0:d[En].mapValue)==null?void 0:m.fields)==null?void 0:I[Ri],s=(M=(x=(V=n.mapValue.fields)==null?void 0:V[En].mapValue)==null?void 0:x.fields)==null?void 0:M[Pi],i=(J=(W=(O=e.mapValue.fields)==null?void 0:O[En].mapValue)==null?void 0:W.fields)==null?void 0:J[Pi],a=ss(t,r);return a!==0?a:ss(s,i)}function fl(n){var c;if("bytesValue"in n)return{subtype:0,bytes:Cn(n.bytesValue)};const e=(c=n.mapValue)==null?void 0:c.fields,t=e==null?void 0:e[Wi],r=t==null?void 0:t.bytesValue;if(!r)throw new Error("Received incorrect value for BsonBinaryData");const s=Cn(r).toUint8Array();if(s.length===0)throw new Error("Received empty bytesValue for BsonBinaryData");const i=s[0],a=s.slice(1);return{subtype:i,bytes:ae.fromUint8Array(a)}}function hf(n,e){const t=fl(n),r=fl(e);return t.subtype!==r.subtype?t.subtype<r.subtype?-1:1:t.bytes.compareTo(r.bytes)}function ff(n,e){var f,d,m,I,V,x,M,O,W,J,se,De,ge,_e,T,g;const t=n.mapValue.fields,r=((I=(m=(d=(f=t==null?void 0:t[Wt])==null?void 0:f.mapValue)==null?void 0:d.fields)==null?void 0:m[Ai])==null?void 0:I.stringValue)??"",s=((O=(M=(x=(V=t==null?void 0:t[Wt])==null?void 0:V.mapValue)==null?void 0:x.fields)==null?void 0:M[bi])==null?void 0:O.stringValue)??"",i=e.mapValue.fields,a=((De=(se=(J=(W=i==null?void 0:i[Wt])==null?void 0:W.mapValue)==null?void 0:J.fields)==null?void 0:se[Ai])==null?void 0:De.stringValue)??"",c=((g=(T=(_e=(ge=i==null?void 0:i[Wt])==null?void 0:ge.mapValue)==null?void 0:_e.fields)==null?void 0:T[bi])==null?void 0:g.stringValue)??"",l=Jr(r,a);return l!==0?l:Q(s,c)}function df(n,e){var t,r,s,i;return Jr(((r=(t=n.mapValue.fields)==null?void 0:t[ts])==null?void 0:r.stringValue)??"",((i=(s=e.mapValue.fields)==null?void 0:s[ts])==null?void 0:i.stringValue)??"")}function rr(n){return Jo(n)}function Jo(n){return"nullValue"in n?"null":"booleanValue"in n?""+n.booleanValue:"integerValue"in n?""+n.integerValue:"doubleValue"in n?""+n.doubleValue:"timestampValue"in n?(function(t){const r=Zt(t);return`time(${r.seconds},${r.nanos})`})(n.timestampValue):"stringValue"in n?n.stringValue:"bytesValue"in n?(function(t){return Cn(t).toBase64()})(n.bytesValue):"referenceValue"in n?(function(t){return F.fromName(t).toString()})(n.referenceValue):"geoPointValue"in n?(function(t){return`geo(${t.latitude},${t.longitude})`})(n.geoPointValue):"arrayValue"in n?(function(t){let r="[",s=!0;for(const i of t.values||[])s?s=!1:r+=",",r+=Jo(i);return r+"]"})(n.arrayValue):"mapValue"in n?(function(t){const r=Object.keys(t.fields||{}).sort();let s="{",i=!0;for(const a of r)i?i=!1:s+=",",s+=`${a}:${Jo(t.fields[a])}`;return s+"}"})(n.mapValue):q(61005,{value:n})}function Vi(n){switch(me(n)){case 0:case 2:return 4;case 3:return et(n)?16:8;case 4:case 11:return 16;case 6:const e=Rs(n);return e?16+Vi(e):16;case 7:return 2*n.stringValue.length;case 8:return"bytesValue"in n?Cn(n.bytesValue).approximateByteSize():dl(n.mapValue);case 9:return n.referenceValue.length;case 13:return(function(r){return(r.values||[]).reduce(((s,i)=>s+Vi(i)),0)})(n.arrayValue);case 14:case 15:case 12:case 10:case 5:case 1:case 16:return dl(n.mapValue);default:throw q(13486,{value:n})}}function dl(n){let e=0;return xn(n.fields,((t,r)=>{e+=t.length+Vi(r)})),e}function pl(n,e){return{referenceValue:`projects/${n.projectId}/databases/${n.database}/documents/${e.path.canonicalString()}`}}function lt(n){return!!n&&"integerValue"in n}function ht(n){return!!n&&"doubleValue"in n}function et(n){var t;if(!((t=n.mapValue)!=null&&t.fields))return!1;const e=n.mapValue.fields;return Sn(e)===1&&e[en]&&!!e[en].stringValue}function tn(n){var t,r;if(!((t=n.mapValue)!=null&&t.fields))return!1;const e=n.mapValue.fields;return Sn(e)===1&&((r=e[Nn])==null?void 0:r.integerValue)!==void 0}function xt(n){return lt(n)||ht(n)||!!n&&tn(n)||!!n&&et(n)}function sr(n){return!!n&&"arrayValue"in n}function Qe(n){return!!n&&"nullValue"in n}function Ae(n){return!(!ht(n)||!isNaN(Number(n.doubleValue)))||!(!et(n)||cf(n)!=="NaN")}function In(n){return!!n&&"mapValue"in n}function pf(n){var r,s;if(!((r=n.mapValue)!=null&&r.fields))return re.ge;const e=n.mapValue.fields,t=(s=e[xa])==null?void 0:s.stringValue;if(t&&cl[t])return cl[t];if(Sn(e)===1){const i=Object.keys(e);return af[i[0]]??re.ge}return re.ge}function Xo(n){var t,r;return((r=(((t=n==null?void 0:n.mapValue)==null?void 0:t.fields)||{})[xa])==null?void 0:r.stringValue)===Na}function Zo(n){var e,t;return(t=(((e=n==null?void 0:n.mapValue)==null?void 0:e.fields)||{})[es])==null?void 0:t.arrayValue}function $r(n){if(n.geoPointValue)return{geoPointValue:{...n.geoPointValue}};if(n.timestampValue&&typeof n.timestampValue=="object")return{timestampValue:{...n.timestampValue}};if(n.mapValue){const e={mapValue:{fields:{}}};return xn(n.mapValue.fields,((t,r)=>e.mapValue.fields[t]=$r(r))),e}if(n.arrayValue){const e={arrayValue:{values:[]}};for(let t=0;t<(n.arrayValue.values||[]).length;++t)e.arrayValue.values[t]=$r(n.arrayValue.values[t]);return e}return{...n}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class He{constructor(e){this.value=e}static empty(){return new He({mapValue:{}})}field(e){if(e.isEmpty())return this.value;{let t=this.value;for(let r=0;r<e.length-1;++r)if(t=(t.mapValue.fields||{})[e.get(r)],!In(t))return null;return t=(t.mapValue.fields||{})[e.lastSegment()],t||null}}set(e,t){this.getFieldsMap(e.popLast())[e.lastSegment()]=$r(t)}setAll(e){let t=Ye.emptyPath(),r={},s=[];e.forEach(((a,c)=>{if(!t.isImmediateParentOf(c)){const l=this.getFieldsMap(t);this.applyChanges(l,r,s),r={},s=[],t=c.popLast()}a?r[c.lastSegment()]=$r(a):s.push(c.lastSegment())}));const i=this.getFieldsMap(t);this.applyChanges(i,r,s)}delete(e){const t=this.field(e.popLast());In(t)&&t.mapValue.fields&&delete t.mapValue.fields[e.lastSegment()]}isEqual(e){return Ze(this.value,e.value)}getFieldsMap(e){let t=this.value;t.mapValue.fields||(t.mapValue={fields:{}});for(let r=0;r<e.length;++r){let s=t.mapValue.fields[e.get(r)];In(s)&&s.mapValue.fields||(s={mapValue:{fields:{}}},t.mapValue.fields[e.get(r)]=s),t=s}return t.mapValue.fields}applyChanges(e,t,r){xn(t,((s,i)=>e[s]=i));for(const s of r)delete e[s]}clone(){return new He($r(this.value))}}function mf(n){const e=[];return xn(n.fields,((t,r)=>{const s=new Ye([t]);if(In(r)&&!(function(a){return ly.has(pf(a))})(r)){const i=mf(r.mapValue).fields;if(i.length===0)e.push(s);else for(const a of i)e.push(s.child(a))}else e.push(s)})),new rt(e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Da(n,e){if(n.useProto3Json){if(isNaN(e))return{doubleValue:"NaN"};if(e===1/0)return{doubleValue:"Infinity"};if(e===-1/0)return{doubleValue:"-Infinity"}}return{doubleValue:Zr(e)?"-0":e}}function Kn(n){return{integerValue:""+n}}function Oa(n,e,t){return ay(e)?Kn(e):Da(n,e)}/**
 * @license
 * Copyright 2018 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Hi{constructor(){this._=void 0}}function hy(n,e,t){return n instanceof is?(function(s,i){const a={fields:{[nf]:{stringValue:tf},[sf]:{timestampValue:{seconds:s.seconds,nanos:s.nanoseconds}}}};return i&&Sa(i)&&(i=Rs(i)),i&&(a.fields[rf]=i),{mapValue:a}})(t,e):n instanceof os?_f(n,e):n instanceof as?yf(n,e):n instanceof cs?(function(s,i){const a=gf(s,i),c=ml(a)+ml(s.xe);return et(a)||et(s.xe)?{mapValue:{fields:{[en]:{stringValue:c.toString()}}}}:tn(a)?ht(s.xe)?{doubleValue:c}:lt(s.xe)?{integerValue:c.toString()}:{mapValue:{fields:{[Nn]:Kn(c)}}}:lt(a)&&(lt(s.xe)||tn(s.xe))?Kn(c):Da(s.serializer,c)})(n,e):n instanceof Si?(function(s,i){return!xt(i)||Ae(s.xe)?s.xe:Ae(i)?i:ss(s.xe,i)<0?s.xe:i})(n,e):n instanceof Ci?(function(s,i){return!xt(i)||Ae(s.xe)?s.xe:Ae(i)?i:ss(s.xe,i)>0?s.xe:i})(n,e):void 0}function fy(n,e,t){return n instanceof os?_f(n,e):n instanceof as?yf(n,e):t}function gf(n,e){return n instanceof cs?xt(e)?e:{integerValue:0}:null}class is extends Hi{}class os extends Hi{constructor(e){super(),this.elements=e}}function _f(n,e){const t=Ef(e);for(const r of n.elements)t.some((s=>Ze(s,r)))||t.push(r);return{arrayValue:{values:t}}}class as extends Hi{constructor(e){super(),this.elements=e}}function yf(n,e){let t=Ef(e);for(const r of n.elements)t=t.filter((s=>!Ze(s,r)));return{arrayValue:{values:t}}}class La extends Hi{constructor(e,t){super(),this.serializer=e,this.xe=t}}class cs extends La{}class Si extends La{}class Ci extends La{}function ml(n){return lt(n)?ue(n.integerValue):ht(n)?ue(n.doubleValue):tn(n)?ue(n.mapValue.fields[Nn].integerValue):et(n)?parseFloat(n.mapValue.fields[en].stringValue):0}function Ef(n){return sr(n)&&n.arrayValue.values?n.arrayValue.values.slice():[]}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class dy{constructor(e,t){this.field=e,this.transform=t}}function py(n,e){return n.field.isEqual(e.field)&&(function(r,s){return r instanceof os&&s instanceof os||r instanceof as&&s instanceof as?Zn(r.elements,s.elements,Ze):r instanceof cs&&s instanceof cs||r instanceof Si&&s instanceof Si||r instanceof Ci&&s instanceof Ci?Ze(r.xe,s.xe):r instanceof is&&s instanceof is})(n.transform,e.transform)}class my{constructor(e,t){this.version=e,this.transformResults=t}}class dt{constructor(e,t){this.updateTime=e,this.exists=t}static none(){return new dt}static exists(e){return new dt(void 0,e)}static updateTime(e){return new dt(e)}get isNone(){return this.updateTime===void 0&&this.exists===void 0}isEqual(e){return this.exists===e.exists&&(this.updateTime?!!e.updateTime&&this.updateTime.isEqual(e.updateTime):!e.updateTime)}}function hi(n,e){return n.updateTime!==void 0?e.isFoundDocument()&&e.version.isEqual(n.updateTime):n.exists===void 0||n.exists===e.isFoundDocument()}class Ki{}function wf(n,e){if(!n.hasLocalMutations||e&&e.fields.length===0)return null;if(e===null)return n.isNoDocument()?new If(n.key,dt.none()):new Ps(n.key,n.data,dt.none());{const t=n.data,r=He.empty();let s=new pe(Ye.comparator);for(let i of e.fields)if(!s.has(i)){let a=t.field(i);a===null&&i.length>1&&(i=i.popLast(),a=t.field(i)),a===null?r.delete(i):r.set(i,a),s=s.add(i)}return new kn(n.key,r,new rt(s.toArray()),dt.none())}}function gy(n,e,t){n instanceof Ps?(function(s,i,a){const c=s.value.clone(),l=_l(s.fieldTransforms,i,a.transformResults);c.setAll(l),i.convertToFoundDocument(a.version,c).setHasCommittedMutations()})(n,e,t):n instanceof kn?(function(s,i,a){if(!hi(s.precondition,i))return void i.convertToUnknownDocument(a.version);const c=_l(s.fieldTransforms,i,a.transformResults),l=i.data;l.setAll(Tf(s)),l.setAll(c),i.convertToFoundDocument(a.version,l).setHasCommittedMutations()})(n,e,t):(function(s,i,a){i.convertToNoDocument(a.version).setHasCommittedMutations()})(0,e,t)}function jr(n,e,t,r){return n instanceof Ps?(function(i,a,c,l){if(!hi(i.precondition,a))return c;const f=i.value.clone(),d=yl(i.fieldTransforms,l,a);return f.setAll(d),a.convertToFoundDocument(a.version,f).setHasLocalMutations(),null})(n,e,t,r):n instanceof kn?(function(i,a,c,l){if(!hi(i.precondition,a))return c;const f=yl(i.fieldTransforms,l,a),d=a.data;return d.setAll(Tf(i)),d.setAll(f),a.convertToFoundDocument(a.version,d).setHasLocalMutations(),c===null?null:c.unionWith(i.fieldMask.fields).unionWith(i.fieldTransforms.map((m=>m.field)))})(n,e,t,r):(function(i,a,c){return hi(i.precondition,a)?(a.convertToNoDocument(a.version).setHasLocalMutations(),null):c})(n,e,t)}function _y(n,e){let t=null;for(const r of n.fieldTransforms){const s=e.data.field(r.field),i=gf(r.transform,s||null);i!=null&&(t===null&&(t=He.empty()),t.set(r.field,i))}return t||null}function gl(n,e){return n.type===e.type&&!!n.key.isEqual(e.key)&&!!n.precondition.isEqual(e.precondition)&&!!(function(r,s){return r===void 0&&s===void 0||!(!r||!s)&&Zn(r,s,((i,a)=>py(i,a)))})(n.fieldTransforms,e.fieldTransforms)&&(n.type===0?n.value.isEqual(e.value):n.type!==1||n.data.isEqual(e.data)&&n.fieldMask.isEqual(e.fieldMask))}class Ps extends Ki{constructor(e,t,r,s=[]){super(),this.key=e,this.value=t,this.precondition=r,this.fieldTransforms=s,this.type=0}getFieldMask(){return null}}class kn extends Ki{constructor(e,t,r,s,i=[]){super(),this.key=e,this.data=t,this.fieldMask=r,this.precondition=s,this.fieldTransforms=i,this.type=1}getFieldMask(){return this.fieldMask}}function Tf(n){const e=new Map;return n.fieldMask.fields.forEach((t=>{if(!t.isEmpty()){const r=n.data.field(t);e.set(t,r)}})),e}function _l(n,e,t){const r=new Map;U(n.length===t.length,32656,{ve:t.length,De:n.length});for(let s=0;s<t.length;s++){const i=n[s],a=i.transform,c=e.data.field(i.field);r.set(i.field,fy(a,c,t[s]))}return r}function yl(n,e,t){const r=new Map;for(const s of n){const i=s.transform,a=t.data.field(s.field);r.set(s.field,hy(i,a,e))}return r}class If extends Ki{constructor(e,t){super(),this.key=e,this.precondition=t,this.type=2,this.fieldTransforms=[]}getFieldMask(){return null}}class yy extends Ki{constructor(e,t){super(),this.key=e,this.precondition=t,this.type=3,this.fieldTransforms=[]}getFieldMask(){return null}}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class xi{constructor(e,t){this.position=e,this.inclusive=t}}function El(n,e,t){let r=0;for(let s=0;s<n.position.length;s++){const i=e[s],a=n.position[s];if(i.field.isKeyField()?r=F.comparator(F.fromName(a.referenceValue),t.key):r=ze(a,t.data.field(i.field)),i.dir==="desc"&&(r*=-1),r!==0)break}return r}function wl(n,e){if(n===null)return e===null;if(e===null||n.inclusive!==e.inclusive||n.position.length!==e.position.length)return!1;for(let t=0;t<n.position.length;t++)if(!Ze(n.position[t],e.position[t]))return!1;return!0}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class vf{}class de extends vf{constructor(e,t,r){super(),this.field=e,this.op=t,this.value=r}static create(e,t,r){return e.isKeyField()?t==="in"||t==="not-in"?this.createKeyFieldInFilter(e,t,r):new wy(e,t,r):t==="array-contains"?new vy(e,r):t==="in"?new Ay(e,r):t==="not-in"?new by(e,r):t==="array-contains-any"?new Ry(e,r):new de(e,t,r)}static createKeyFieldInFilter(e,t,r){return t==="in"?new Ty(e,r):new Iy(e,r)}matches(e){const t=e.data.field(this.field);return this.op==="!="?t!==null&&t.nullValue===void 0&&this.matchesComparison(ze(t,this.value)):t!==null&&me(this.value)===me(t)&&this.matchesComparison(ze(t,this.value))}matchesComparison(e){switch(this.op){case"<":return e<0;case"<=":return e<=0;case"==":return e===0;case"!=":return e!==0;case">":return e>0;case">=":return e>=0;default:return q(47266,{operator:this.op})}}isInequality(){return["<","<=",">",">=","!=","not-in"].indexOf(this.op)>=0}getFlattenedFilters(){return[this]}getFilters(){return[this]}}class ot extends vf{constructor(e,t){super(),this.filters=e,this.op=t,this.Ce=null}static create(e,t){return new ot(e,t)}matches(e){return Af(this)?this.filters.find((t=>!t.matches(e)))===void 0:this.filters.find((t=>t.matches(e)))!==void 0}getFlattenedFilters(){return this.Ce!==null||(this.Ce=this.filters.reduce(((e,t)=>e.concat(t.getFlattenedFilters())),[])),this.Ce}getFilters(){return Object.assign([],this.filters)}}function Af(n){return n.op==="and"}function bf(n){return Ey(n)&&Af(n)}function Ey(n){for(const e of n.filters)if(e instanceof ot)return!1;return!0}function ea(n){if(n instanceof de)return n.field.canonicalString()+n.op.toString()+rr(n.value);if(bf(n))return n.filters.map((e=>ea(e))).join(",");{const e=n.filters.map((t=>ea(t))).join(",");return`${n.op}(${e})`}}function Rf(n,e){return n instanceof de?(function(r,s){return s instanceof de&&r.op===s.op&&r.field.isEqual(s.field)&&Ze(r.value,s.value)})(n,e):n instanceof ot?(function(r,s){return s instanceof ot&&r.op===s.op&&r.filters.length===s.filters.length?r.filters.reduce(((i,a,c)=>i&&Rf(a,s.filters[c])),!0):!1})(n,e):void q(19439)}function Pf(n){return n instanceof de?(function(t){return`${t.field.canonicalString()} ${t.op} ${rr(t.value)}`})(n):n instanceof ot?(function(t){return t.op.toString()+" {"+t.getFilters().map(Pf).join(" ,")+"}"})(n):"Filter"}class wy extends de{constructor(e,t,r){super(e,t,r),this.key=F.fromName(r.referenceValue)}matches(e){const t=F.comparator(e.key,this.key);return this.matchesComparison(t)}}class Ty extends de{constructor(e,t){super(e,"in",t),this.keys=Vf("in",t)}matches(e){return this.keys.some((t=>t.isEqual(e.key)))}}class Iy extends de{constructor(e,t){super(e,"not-in",t),this.keys=Vf("not-in",t)}matches(e){return!this.keys.some((t=>t.isEqual(e.key)))}}function Vf(n,e){var t;return(((t=e.arrayValue)==null?void 0:t.values)||[]).map((r=>F.fromName(r.referenceValue)))}class vy extends de{constructor(e,t){super(e,"array-contains",t)}matches(e){const t=e.data.field(this.field);return sr(t)&&ns(t.arrayValue,this.value)}}class Ay extends de{constructor(e,t){super(e,"in",t)}matches(e){const t=e.data.field(this.field);return t!==null&&ns(this.value.arrayValue,t)}}class by extends de{constructor(e,t){super(e,"not-in",t)}matches(e){if(ns(this.value.arrayValue,{nullValue:"NULL_VALUE"}))return!1;const t=e.data.field(this.field);return t!==null&&t.nullValue===void 0&&!ns(this.value.arrayValue,t)}}class Ry extends de{constructor(e,t){super(e,"array-contains-any",t)}matches(e){const t=e.data.field(this.field);return!(!sr(t)||!t.arrayValue.values)&&t.arrayValue.values.some((r=>ns(this.value.arrayValue,r)))}}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class us{constructor(e,t="asc"){this.field=e,this.dir=t}}function Py(n,e){return n.dir===e.dir&&n.field.isEqual(e.field)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class G{static fromTimestamp(e){return new G(e)}static min(){return new G(new te(0,0))}static max(){return new G(new te(253402300799,999999999))}constructor(e){this.timestamp=e}compareTo(e){return this.timestamp._compareTo(e.timestamp)}isEqual(e){return this.timestamp.isEqual(e.timestamp)}toMicroseconds(){return 1e6*this.timestamp.seconds+this.timestamp.nanoseconds/1e3}toString(){return"SnapshotVersion("+this.timestamp.toString()+")"}toTimestamp(){return this.timestamp}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class xe{constructor(e,t,r,s,i,a,c){this.key=e,this.documentType=t,this.version=r,this.readTime=s,this.createTime=i,this.data=a,this.documentState=c}static newInvalidDocument(e){return new xe(e,0,G.min(),G.min(),G.min(),He.empty(),0)}static newFoundDocument(e,t,r,s){return new xe(e,1,t,G.min(),r,s,0)}static newNoDocument(e,t){return new xe(e,2,t,G.min(),G.min(),He.empty(),0)}static newUnknownDocument(e,t){return new xe(e,3,t,G.min(),G.min(),He.empty(),2)}convertToFoundDocument(e,t){return!this.createTime.isEqual(G.min())||this.documentType!==2&&this.documentType!==0||(this.createTime=e),this.version=e,this.documentType=1,this.data=t,this.documentState=0,this}convertToNoDocument(e){return this.version=e,this.documentType=2,this.data=He.empty(),this.documentState=0,this}convertToUnknownDocument(e){return this.version=e,this.documentType=3,this.data=He.empty(),this.documentState=2,this}setHasCommittedMutations(){return this.documentState=2,this}setHasLocalMutations(){return this.documentState=1,this.version=G.min(),this}setReadTime(e){return this.readTime=e,this}get hasLocalMutations(){return this.documentState===1}get hasCommittedMutations(){return this.documentState===2}get hasPendingWrites(){return this.hasLocalMutations||this.hasCommittedMutations}isValidDocument(){return this.documentType!==0}isFoundDocument(){return this.documentType===1}isNoDocument(){return this.documentType===2}isUnknownDocument(){return this.documentType===3}isEqual(e){return e instanceof xe&&this.key.isEqual(e.key)&&this.version.isEqual(e.version)&&this.documentType===e.documentType&&this.documentState===e.documentState&&this.data.isEqual(e.data)}mutableCopy(){return new xe(this.key,this.documentType,this.version,this.readTime,this.createTime,this.data.clone(),this.documentState)}toString(){return`Document(${this.key}, ${this.version}, ${JSON.stringify(this.data.value)}, {createTime: ${this.createTime}}), {documentType: ${this.documentType}}), {documentState: ${this.documentState}})`}}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const ls=-1;function Vy(n,e){const t=n.toTimestamp().seconds,r=n.toTimestamp().nanoseconds+1,s=G.fromTimestamp(r===1e9?new te(t+1,0):new te(t,r));return new nn(s,F.empty(),e)}function Sy(n){return new nn(n.readTime,n.key,ls)}class nn{constructor(e,t,r){this.readTime=e,this.documentKey=t,this.largestBatchId=r}static min(){return new nn(G.min(),F.empty(),ls)}static max(){return new nn(G.max(),F.empty(),ls)}}function Cy(n,e){let t=n.readTime.compareTo(e.readTime);return t!==0?t:(t=F.comparator(n.documentKey,e.documentKey),t!==0?t:Q(n.largestBatchId,e.largestBatchId))}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class xy{constructor(e,t=null,r=[],s=[],i=null,a=null,c=null){this.path=e,this.collectionGroup=t,this.orderBy=r,this.filters=s,this.limit=i,this.startAt=a,this.endAt=c,this.Fe=null}}function Tl(n,e=null,t=[],r=[],s=null,i=null,a=null){return new xy(n,e,t,r,s,i,a)}function Sf(n){const e=H(n);if(e.Fe===null){let t=e.path.canonicalString();e.collectionGroup!==null&&(t+="|cg:"+e.collectionGroup),t+="|f:",t+=e.filters.map((r=>ea(r))).join(","),t+="|ob:",t+=e.orderBy.map((r=>(function(i){return i.field.canonicalString()+i.dir})(r))).join(","),Gi(e.limit)||(t+="|l:",t+=e.limit),e.startAt&&(t+="|lb:",t+=e.startAt.inclusive?"b:":"a:",t+=e.startAt.position.map((r=>rr(r))).join(",")),e.endAt&&(t+="|ub:",t+=e.endAt.inclusive?"a:":"b:",t+=e.endAt.position.map((r=>rr(r))).join(",")),e.Fe=t}return e.Fe}function Cf(n,e){if(n.limit!==e.limit||n.orderBy.length!==e.orderBy.length)return!1;for(let t=0;t<n.orderBy.length;t++)if(!Py(n.orderBy[t],e.orderBy[t]))return!1;if(n.filters.length!==e.filters.length)return!1;for(let t=0;t<n.filters.length;t++)if(!Rf(n.filters[t],e.filters[t]))return!1;return n.collectionGroup===e.collectionGroup&&!!n.path.isEqual(e.path)&&!!wl(n.startAt,e.startAt)&&wl(n.endAt,e.endAt)}function _n(n){return!!n.isCorePipeline}function xf(n){return!!n.path&&F.isDocumentKey(n.path)&&n.collectionGroup===null&&n.filters.length===0}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class hr{constructor(e,t=null,r=[],s=[],i=null,a="F",c=null,l=null){this.path=e,this.collectionGroup=t,this.explicitOrderBy=r,this.filters=s,this.limit=i,this.limitType=a,this.startAt=c,this.endAt=l,this.Oe=null,this.Me=null,this.Ne=null,this.startAt,this.endAt}}function Ny(n,e,t,r,s,i,a,c){return new hr(n,e,t,r,s,i,a,c)}function Qi(n){return new hr(n)}function Il(n){return n.filters.length===0&&n.limit===null&&n.startAt==null&&n.endAt==null&&(n.explicitOrderBy.length===0||n.explicitOrderBy.length===1&&n.explicitOrderBy[0].field.isKeyField())}function ky(n){return F.isDocumentKey(n.path)&&n.collectionGroup===null&&n.filters.length===0}function Nf(n){return n.collectionGroup!==null}function zr(n){const e=H(n);if(e.Oe===null){e.Oe=[];const t=new Set;for(const i of e.explicitOrderBy)e.Oe.push(i),t.add(i.field.canonicalString());const r=e.explicitOrderBy.length>0?e.explicitOrderBy[e.explicitOrderBy.length-1].dir:"asc";(function(a){let c=new pe(Ye.comparator);return a.filters.forEach((l=>{l.getFlattenedFilters().forEach((f=>{f.isInequality()&&(c=c.add(f.field))}))})),c})(e).forEach((i=>{t.has(i.canonicalString())||i.isKeyField()||e.Oe.push(new us(i,r))})),t.has(Ye.keyField().canonicalString())||e.Oe.push(new us(Ye.keyField(),r))}return e.Oe}function pt(n){const e=H(n);return e.Me||(e.Me=Dy(e,zr(n))),e.Me}function Dy(n,e){if(n.limitType==="F")return Tl(n.path,n.collectionGroup,e,n.filters,n.limit,n.startAt,n.endAt);{e=e.map((s=>{const i=s.dir==="desc"?"asc":"desc";return new us(s.field,i)}));const t=n.endAt?new xi(n.endAt.position,n.endAt.inclusive):null,r=n.startAt?new xi(n.startAt.position,n.startAt.inclusive):null;return Tl(n.path,n.collectionGroup,e,n.filters,n.limit,t,r)}}function ta(n,e){const t=n.filters.concat([e]);return new hr(n.path,n.collectionGroup,n.explicitOrderBy.slice(),t,n.limit,n.limitType,n.startAt,n.endAt)}function Oy(n,e){const t=n.explicitOrderBy.concat([e]);return new hr(n.path,n.collectionGroup,t,n.filters.slice(),n.limit,n.limitType,n.startAt,n.endAt)}function Ni(n,e,t){return new hr(n.path,n.collectionGroup,n.explicitOrderBy.slice(),n.filters.slice(),e,t,n.startAt,n.endAt)}function Ly(n,e){return Cf(pt(n),pt(e))&&n.limitType===e.limitType}function Gr(n){return`Query(target=${(function(t){let r=t.path.canonicalString();return t.collectionGroup!==null&&(r+=" collectionGroup="+t.collectionGroup),t.filters.length>0&&(r+=`, filters: [${t.filters.map((s=>Pf(s))).join(", ")}]`),Gi(t.limit)||(r+=", limit: "+t.limit),t.orderBy.length>0&&(r+=`, orderBy: [${t.orderBy.map((s=>(function(a){return`${a.field.canonicalString()} (${a.dir})`})(s))).join(", ")}]`),t.startAt&&(r+=", startAt: ",r+=t.startAt.inclusive?"b:":"a:",r+=t.startAt.position.map((s=>rr(s))).join(",")),t.endAt&&(r+=", endAt: ",r+=t.endAt.inclusive?"a:":"b:",r+=t.endAt.position.map((s=>rr(s))).join(",")),`Target(${r})`})(pt(n))}; limitType=${n.limitType})`}function Yi(n,e){return e.isFoundDocument()&&(function(r,s){const i=s.key.path;return r.collectionGroup!==null?s.key.hasCollectionId(r.collectionGroup)&&r.path.isPrefixOf(i):F.isDocumentKey(r.path)?r.path.isEqual(i):r.path.isImmediateParentOf(i)})(n,e)&&(function(r,s){for(const i of zr(r))if(!i.field.isKeyField()&&s.data.field(i.field)===null)return!1;return!0})(n,e)&&(function(r,s){for(const i of r.filters)if(!i.matches(s))return!1;return!0})(n,e)&&(function(r,s){return!(r.startAt&&!(function(a,c,l){const f=El(a,c,l);return a.inclusive?f<=0:f<0})(r.startAt,zr(r),s)||r.endAt&&!(function(a,c,l){const f=El(a,c,l);return a.inclusive?f>=0:f>0})(r.endAt,zr(r),s))})(n,e)}function Ma(n){return(e,t)=>{let r=!1;for(const s of zr(n)){const i=My(s,e,t);if(i!==0)return i;r=r||s.field.isKeyField()}return 0}}function My(n,e,t){const r=n.field.isKeyField()?F.comparator(e.key,t.key):(function(i,a,c){const l=a.data.field(i),f=c.data.field(i);return l!==null&&f!==null?ze(l,f):q(42886)})(n.field,e,t);switch(n.dir){case"asc":return r;case"desc":return-1*r;default:return q(19790,{direction:n.dir})}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Uy{constructor(e,t){this.count=e,this.unchangedNames=t}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */var fe,Z;function Fy(n){switch(n){case S.OK:return q(64938);case S.CANCELLED:case S.UNKNOWN:case S.DEADLINE_EXCEEDED:case S.RESOURCE_EXHAUSTED:case S.INTERNAL:case S.UNAVAILABLE:case S.UNAUTHENTICATED:return!1;case S.INVALID_ARGUMENT:case S.NOT_FOUND:case S.ALREADY_EXISTS:case S.PERMISSION_DENIED:case S.FAILED_PRECONDITION:case S.ABORTED:case S.OUT_OF_RANGE:case S.UNIMPLEMENTED:case S.DATA_LOSS:return!0;default:return q(15467,{code:n})}}function kf(n){if(n===void 0)return Ct("GRPC error has no .code"),S.UNKNOWN;switch(n){case fe.OK:return S.OK;case fe.CANCELLED:return S.CANCELLED;case fe.UNKNOWN:return S.UNKNOWN;case fe.DEADLINE_EXCEEDED:return S.DEADLINE_EXCEEDED;case fe.RESOURCE_EXHAUSTED:return S.RESOURCE_EXHAUSTED;case fe.INTERNAL:return S.INTERNAL;case fe.UNAVAILABLE:return S.UNAVAILABLE;case fe.UNAUTHENTICATED:return S.UNAUTHENTICATED;case fe.INVALID_ARGUMENT:return S.INVALID_ARGUMENT;case fe.NOT_FOUND:return S.NOT_FOUND;case fe.ALREADY_EXISTS:return S.ALREADY_EXISTS;case fe.PERMISSION_DENIED:return S.PERMISSION_DENIED;case fe.FAILED_PRECONDITION:return S.FAILED_PRECONDITION;case fe.ABORTED:return S.ABORTED;case fe.OUT_OF_RANGE:return S.OUT_OF_RANGE;case fe.UNIMPLEMENTED:return S.UNIMPLEMENTED;case fe.DATA_LOSS:return S.DATA_LOSS;default:return q(39323,{code:n})}}(Z=fe||(fe={}))[Z.OK=0]="OK",Z[Z.CANCELLED=1]="CANCELLED",Z[Z.UNKNOWN=2]="UNKNOWN",Z[Z.INVALID_ARGUMENT=3]="INVALID_ARGUMENT",Z[Z.DEADLINE_EXCEEDED=4]="DEADLINE_EXCEEDED",Z[Z.NOT_FOUND=5]="NOT_FOUND",Z[Z.ALREADY_EXISTS=6]="ALREADY_EXISTS",Z[Z.PERMISSION_DENIED=7]="PERMISSION_DENIED",Z[Z.UNAUTHENTICATED=16]="UNAUTHENTICATED",Z[Z.RESOURCE_EXHAUSTED=8]="RESOURCE_EXHAUSTED",Z[Z.FAILED_PRECONDITION=9]="FAILED_PRECONDITION",Z[Z.ABORTED=10]="ABORTED",Z[Z.OUT_OF_RANGE=11]="OUT_OF_RANGE",Z[Z.UNIMPLEMENTED=12]="UNIMPLEMENTED",Z[Z.INTERNAL=13]="INTERNAL",Z[Z.UNAVAILABLE=14]="UNAVAILABLE",Z[Z.DATA_LOSS=15]="DATA_LOSS";/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Dn{constructor(e,t){this.mapKeyFn=e,this.equalsFn=t,this.inner={},this.innerSize=0}get(e){const t=this.mapKeyFn(e),r=this.inner[t];if(r!==void 0){for(const[s,i]of r)if(this.equalsFn(s,e))return i}}has(e){return this.get(e)!==void 0}set(e,t){const r=this.mapKeyFn(e),s=this.inner[r];if(s===void 0)return this.inner[r]=[[e,t]],void this.innerSize++;for(let i=0;i<s.length;i++)if(this.equalsFn(s[i][0],e))return void(s[i]=[e,t]);s.push([e,t]),this.innerSize++}delete(e){const t=this.mapKeyFn(e),r=this.inner[t];if(r===void 0)return!1;for(let s=0;s<r.length;s++)if(this.equalsFn(r[s][0],e))return r.length===1?delete this.inner[t]:r.splice(s,1),this.innerSize--,!0;return!1}forEach(e){xn(this.inner,((t,r)=>{for(const[s,i]of r)e(s,i)}))}isEmpty(){return Xh(this.inner)}size(){return this.innerSize}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const By=new oe(F.comparator);function Be(){return By}const Df=new oe(F.comparator);function $n(...n){let e=Df;for(const t of n)e=e.insert(t.key,t);return e}function Of(n){let e=Df;return n.forEach(((t,r)=>e=e.insert(t,r.overlayedDocument))),e}function Gt(){return Wr()}function Lf(){return Wr()}function Wr(){return new Dn((n=>n.toString()),((n,e)=>n.isEqual(e)))}const qy=new oe(F.comparator),$y=new pe(F.comparator);function Y(...n){let e=$y;for(const t of n)e=e.add(t);return e}const jy=new pe(Q);function zy(){return jy}/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Gy(){return new TextEncoder}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Wy=new Kt([4294967295,4294967295],0);function vl(n){const e=Gy().encode(n),t=new Gh;return t.update(e),new Uint8Array(t.digest())}function Al(n){const e=new DataView(n.buffer),t=e.getUint32(0,!0),r=e.getUint32(4,!0),s=e.getUint32(8,!0),i=e.getUint32(12,!0);return[new Kt([t,r],0),new Kt([s,i],0)]}class Ua{constructor(e,t,r){if(this.bitmap=e,this.padding=t,this.hashCount=r,t<0||t>=8)throw new Ur(`Invalid padding: ${t}`);if(r<0)throw new Ur(`Invalid hash count: ${r}`);if(e.length>0&&this.hashCount===0)throw new Ur(`Invalid hash count: ${r}`);if(e.length===0&&t!==0)throw new Ur(`Invalid padding when bitmap length is 0: ${t}`);this.Be=8*e.length-t,this.Le=Kt.fromNumber(this.Be)}$e(e,t,r){let s=e.add(t.multiply(Kt.fromNumber(r)));return s.compare(Wy)===1&&(s=new Kt([s.getBits(0),s.getBits(1)],0)),s.modulo(this.Le).toNumber()}Ue(e){return!!(this.bitmap[Math.floor(e/8)]&1<<e%8)}mightContain(e){if(this.Be===0)return!1;const t=vl(e),[r,s]=Al(t);for(let i=0;i<this.hashCount;i++){const a=this.$e(r,s,i);if(!this.Ue(a))return!1}return!0}static create(e,t,r){const s=e%8==0?0:8-e%8,i=new Uint8Array(Math.ceil(e/8)),a=new Ua(i,s,t);return r.forEach((c=>a.insert(c))),a}insert(e){if(this.Be===0)return;const t=vl(e),[r,s]=Al(t);for(let i=0;i<this.hashCount;i++){const a=this.$e(r,s,i);this.ke(a)}}ke(e){const t=Math.floor(e/8),r=e%8;this.bitmap[t]|=1<<r}}class Ur extends Error{constructor(){super(...arguments),this.name="BloomFilterError"}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Vs{constructor(e,t,r,s,i,a){this.snapshotVersion=e,this.targetChanges=t,this.targetMismatches=r,this.documentUpdates=s,this.augmentedDocumentUpdates=i,this.resolvedLimboDocuments=a}static createSynthesizedRemoteEventForCurrentChange(e,t,r){const s=new Map;return s.set(e,Ss.createSynthesizedTargetChangeForCurrentChange(e,t,r)),new Vs(G.min(),s,new oe(Q),Be(),Be(),Y())}}class Ss{constructor(e,t,r,s,i){this.resumeToken=e,this.current=t,this.addedDocuments=r,this.modifiedDocuments=s,this.removedDocuments=i}static createSynthesizedTargetChangeForCurrentChange(e,t,r){return new Ss(r,t,Y(),Y(),Y())}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class fi{constructor(e,t,r,s){this.Qe=e,this.removedTargetIds=t,this.key=r,this.qe=s}}class Mf{constructor(e,t){this.targetId=e,this.Ke=t}}class Uf{constructor(e,t,r=ae.EMPTY_BYTE_STRING,s=null){this.state=e,this.targetIds=t,this.resumeToken=r,this.cause=s}}class bl{constructor(e){this.targetId=e,this.We=0,this.Ge=Rl(),this.je=ae.EMPTY_BYTE_STRING,this.ze=!1,this.He=!0}get current(){return this.ze}get resumeToken(){return this.je}get Je(){return this.We!==0}get Ye(){return this.He}Ze(e){e.approximateByteSize()>0&&(this.He=!0,this.je=e)}Xe(){let e=Y(),t=Y(),r=Y();return this.Ge.forEach(((s,i)=>{switch(i){case 0:e=e.add(s);break;case 2:t=t.add(s);break;case 1:r=r.add(s);break;default:q(38017,{changeType:i})}})),new Ss(this.je,this.ze,e,t,r)}et(){this.He=!1,this.Ge=Rl()}tt(e,t){this.He=!0,this.Ge=this.Ge.insert(e,t)}nt(e){this.He=!0,this.Ge=this.Ge.remove(e)}rt(){this.We+=1}it(){this.We-=1,U(this.We>=0,3241,{We:this.We,targetId:this.targetId})}st(){this.He=!0,this.ze=!0}}const Dr="WatchChangeAggregator";class Hy{constructor(e){this._t=e,this.ot=new Map,this.ut=Be(),this.ct=ei(),this.lt=Be(),this.Et=ei(),this.ht=new oe(Q)}Tt(e){for(const t of e.Qe)e.qe&&e.qe.isFoundDocument()?this.Pt(t,e.qe):this.It(t,e.key,e.qe);for(const t of e.removedTargetIds)this.It(t,e.key,e.qe)}Rt(e){this.forEachTarget(e,(t=>{const r=this.ot.get(t);if(r)switch(e.state){case 0:this.At(t)&&r.Ze(e.resumeToken);break;case 1:r.it(),r.Je||r.et(),r.Ze(e.resumeToken);break;case 2:r.it(),r.Je||this.removeTarget(t);break;case 3:this.At(t)&&(r.st(),r.Ze(e.resumeToken));break;case 4:this.At(t)&&(this.Vt(t),r.Ze(e.resumeToken));break;default:q(56790,{state:e.state})}else L(Dr,`handleTargetChange received targetChange for untracked target ID (${t}) with state (${e.state})`)}))}forEachTarget(e,t){e.targetIds.length>0?e.targetIds.forEach(t):this.ot.forEach(((r,s)=>{this.At(s)&&t(s)}))}dt(e){var t;return _n(e)?e.getPipelineSourceType()==="documents"&&((t=e.getPipelineDocuments())==null?void 0:t.length)===1:xf(e)}ft(e){const t=e.targetId,r=e.Ke.count,s=this.gt(t);if(s){const i=s.target;if(this.dt(i))if(r===0){const a=new F(_n(i)?ee.fromString(i.getPipelineDocuments()[0]):i.path);this.It(t,a,xe.newNoDocument(a,G.min()))}else U(r===1,20013,"Single document existence filter with count: "+r);else{const a=this.yt(t);if(a!==r){const c=this.wt(e),l=c?this.bt(c,e,a):1;if(l!==0){this.Vt(t);const f=l===2?"TargetPurposeExistenceFilterMismatchBloom":"TargetPurposeExistenceFilterMismatch";this.ht=this.ht.insert(t,f)}}}}}wt(e){const t=e.Ke.unchangedNames;if(!t||!t.bits)return null;const{bits:{bitmap:r="",padding:s=0},hashCount:i=0}=t;let a,c;try{a=Cn(r).toUint8Array()}catch(l){if(l instanceof ef)return it("Decoding the base64 bloom filter in existence filter failed ("+l.message+"); ignoring the bloom filter and falling back to full re-query."),null;throw l}try{c=new Ua(a,s,i)}catch(l){return it(l instanceof Ur?"BloomFilter error: ":"Applying bloom filter failed: ",l),null}return c.Be===0?null:c}bt(e,t,r){return t.Ke.count===r-this.vt(e,t.targetId)?0:2}vt(e,t){const r=this._t.getRemoteKeysForTarget(t);let s=0;return r.forEach((i=>{const a=this._t.xt(),c=`projects/${a.projectId}/databases/${a.database}/documents/${i.path.canonicalString()}`;e.mightContain(c)||(this.It(t,i,null),s++)})),s}Dt(e){const t=new Map;this.ot.forEach(((i,a)=>{const c=this.gt(a);if(c){if(i.current&&this.dt(c.target)){const l=_n(c.target)?ee.fromString(c.target.getPipelineDocuments()[0]):c.target.path,f=new F(l);this.Ct(f).has(a)||this.Ft(a,f)||this.It(a,f,xe.newNoDocument(f,e))}i.Ye&&(t.set(a,i.Xe()),i.et())}}));let r=Y();this.Et.forEach(((i,a)=>{let c=!0;a.forEachWhile((l=>{const f=this.gt(l);return!f||f.purpose==="TargetPurposeLimboResolution"||(c=!1,!1)})),c&&(r=r.add(i))})),this.ut.forEach(((i,a)=>a.setReadTime(e))),this.lt.forEach(((i,a)=>a.setReadTime(e)));const s=new Vs(e,t,this.ht,this.ut,this.lt,r);return this.ut=Be(),this.ct=ei(),this.lt=Be(),this.Et=ei(),this.ht=new oe(Q),s}Pt(e,t){const r=this.ot.get(e);if(!r||!this.At(e))return void L(Dr,`addDocumentToTarget received document for unknown inactive target (${e})`);const s=this.Ft(e,t.key)?2:0;r.tt(t.key,s),_n(this.gt(e).target)&&this.gt(e).target.getPipelineFlavor()!=="exact"?this.lt=this.lt.insert(t.key,t):this.ut=this.ut.insert(t.key,t),this.ct=this.ct.insert(t.key,this.Ct(t.key).add(e)),this.Et=this.Et.insert(t.key,this.Ot(t.key).add(e))}It(e,t,r){const s=this.ot.get(e);s&&this.At(e)?(this.Ft(e,t)?s.tt(t,1):s.nt(t),this.Et=this.Et.insert(t,this.Ot(t).delete(e)),this.Et=this.Et.insert(t,this.Ot(t).add(e)),r&&(_n(this.gt(e).target)&&this.gt(e).target.getPipelineFlavor()!=="exact"?this.lt=this.lt.insert(t,r):this.ut=this.ut.insert(t,r))):L(Dr,`removeDocumentFromTarget received document for unknown or inactive target (${e})`)}removeTarget(e){this.ot.delete(e)}yt(e){const t=this.ot.get(e);if(!t)return 0;const r=t.Xe();return this._t.getRemoteKeysForTarget(e).size+r.addedDocuments.size-r.removedDocuments.size}rt(e){let t=this.ot.get(e);t||(L(Dr,`recordPendingTargetRequest set up tracking for target ID ${e}`),t=new bl(e),this.ot.set(e,t)),t.rt()}Ot(e){let t=this.Et.get(e);return t||(t=new pe(Q),this.Et=this.Et.insert(e,t)),t}Ct(e){let t=this.ct.get(e);return t||(t=new pe(Q),this.ct=this.ct.insert(e,t)),t}At(e){const t=this.gt(e)!==null;return t||L(Dr,"Detected inactive target",e),t}gt(e){const t=this.ot.get(e);return t===void 0||t.Je?null:this._t.Mt(e)}Vt(e){this.ot.set(e,new bl(e)),this._t.getRemoteKeysForTarget(e).forEach((t=>{this.It(e,t,null)}))}Ft(e,t){return this._t.getRemoteKeysForTarget(e).has(t)}}function ei(){return new oe(F.comparator)}function Rl(){return new oe(F.comparator)}const Ky={asc:"ASCENDING",desc:"DESCENDING"},Qy={"<":"LESS_THAN","<=":"LESS_THAN_OR_EQUAL",">":"GREATER_THAN",">=":"GREATER_THAN_OR_EQUAL","==":"EQUAL","!=":"NOT_EQUAL","array-contains":"ARRAY_CONTAINS",in:"IN","not-in":"NOT_IN","array-contains-any":"ARRAY_CONTAINS_ANY"},Yy={and:"AND",or:"OR"};class Jy{constructor(e,t){this.databaseId=e,this.useProto3Json=t}}function na(n,e){return n.useProto3Json||Gi(e)?e:{value:e}}function Hr(n,e){return n.useProto3Json?`${new Date(1e3*e.seconds).toISOString().replace(/\.\d*/,"").replace("Z","")}.${("000000000"+e.nanoseconds).slice(-9)}Z`:{seconds:""+e.seconds,nanos:e.nanoseconds}}function Fa(n){const e=Zt(n);return new te(e.seconds,e.nanos)}function ra(n,e){return n.useProto3Json?e.toBase64():e.toUint8Array()}function di(n,e){return Hr(n,e.toTimestamp())}function mt(n){return U(!!n,49232),G.fromTimestamp(Fa(n))}function Ba(n,e){return sa(n,e).canonicalString()}function sa(n,e){const t=(function(s){return new ee(["projects",s.projectId,"databases",s.database])})(n).child("documents");return e===void 0?t:t.child(e)}function Ff(n){const e=ee.fromString(n);return U(zf(e),10190,{key:e.toString()}),e}function ki(n,e){return Ba(n.databaseId,e.path)}function Uo(n,e){const t=Ff(e);if(t.get(1)!==n.databaseId.projectId)throw new D(S.INVALID_ARGUMENT,"Tried to deserialize key from different project: "+t.get(1)+" vs "+n.databaseId.projectId);if(t.get(3)!==n.databaseId.database)throw new D(S.INVALID_ARGUMENT,"Tried to deserialize key from different database: "+t.get(3)+" vs "+n.databaseId.database);return new F(qf(t))}function Bf(n,e){return Ba(n.databaseId,e)}function Xy(n){const e=Ff(n);return e.length===4?ee.emptyPath():qf(e)}function ia(n){return new ee(["projects",n.databaseId.projectId,"databases",n.databaseId.database]).canonicalString()}function qf(n){return U(n.length>4&&n.get(4)==="documents",29091,{key:n.toString()}),n.popFirst(5)}function Pl(n,e,t){return{name:ki(n,e),fields:t.value.mapValue.fields}}function Zy(n,e){let t;if("targetChange"in e){e.targetChange;const r=(function(f){return f==="NO_CHANGE"?0:f==="ADD"?1:f==="REMOVE"?2:f==="CURRENT"?3:f==="RESET"?4:q(39313,{state:f})})(e.targetChange.targetChangeType||"NO_CHANGE"),s=e.targetChange.targetIds||[],i=(function(f,d){return f.useProto3Json?(U(d===void 0||typeof d=="string",58123),ae.fromBase64String(d||"")):(U(d===void 0||d instanceof Buffer||d instanceof Uint8Array,16193),ae.fromUint8Array(d||new Uint8Array))})(n,e.targetChange.resumeToken),a=e.targetChange.cause,c=a&&(function(f){const d=f.code===void 0?S.UNKNOWN:kf(f.code);return new D(d,f.message||"")})(a);t=new Uf(r,s,i,c||null)}else if("documentChange"in e){e.documentChange;const r=e.documentChange;r.document,r.document.name,r.document.updateTime;const s=Uo(n,r.document.name),i=mt(r.document.updateTime),a=r.document.createTime?mt(r.document.createTime):G.min(),c=new He({mapValue:{fields:r.document.fields}}),l=xe.newFoundDocument(s,i,a,c),f=r.targetIds||[],d=r.removedTargetIds||[];t=new fi(f,d,l.key,l)}else if("documentDelete"in e){e.documentDelete;const r=e.documentDelete;r.document;const s=Uo(n,r.document),i=r.readTime?mt(r.readTime):G.min(),a=xe.newNoDocument(s,i),c=r.removedTargetIds||[];t=new fi([],c,a.key,a)}else if("documentRemove"in e){e.documentRemove;const r=e.documentRemove;r.document;const s=Uo(n,r.document),i=r.removedTargetIds||[];t=new fi([],i,s,null)}else{if(!("filter"in e))return q(11601,{Nt:e});{e.filter;const r=e.filter;r.targetId;const{count:s=0,unchangedNames:i}=r,a=new Uy(s,i),c=r.targetId;t=new Mf(c,a)}}return t}function eE(n,e){let t;if(e instanceof Ps)t={update:Pl(n,e.key,e.value)};else if(e instanceof If)t={delete:ki(n,e.key)};else if(e instanceof kn)t={update:Pl(n,e.key,e.data),updateMask:lE(e.fieldMask)};else{if(!(e instanceof yy))return q(16599,{Bt:e.type});t={verify:ki(n,e.key)}}return e.fieldTransforms.length>0&&(t.updateTransforms=e.fieldTransforms.map((r=>(function(i,a){const c=a.transform;if(c instanceof is)return{fieldPath:a.field.canonicalString(),setToServerValue:"REQUEST_TIME"};if(c instanceof os)return{fieldPath:a.field.canonicalString(),appendMissingElements:{values:c.elements}};if(c instanceof as)return{fieldPath:a.field.canonicalString(),removeAllFromArray:{values:c.elements}};if(c instanceof cs)return{fieldPath:a.field.canonicalString(),increment:c.xe};if(c instanceof Si)return{fieldPath:a.field.canonicalString(),minimum:c.xe};if(c instanceof Ci)return{fieldPath:a.field.canonicalString(),maximum:c.xe};throw q(20930,{transform:a.transform})})(0,r)))),e.precondition.isNone||(t.currentDocument=(function(s,i){return i.updateTime!==void 0?{updateTime:di(s,i.updateTime)}:i.exists!==void 0?{exists:i.exists}:q(27497)})(n,e.precondition)),t}function tE(n,e){return n&&n.length>0?(U(e!==void 0,14353),n.map((t=>(function(s,i){let a=s.updateTime?mt(s.updateTime):mt(i);return a.isEqual(G.min())&&(a=mt(i)),new my(a,s.transformResults||[])})(t,e)))):[]}function nE(n,e){return{documents:[Bf(n,e.path)]}}function rE(n,e){const t={structuredQuery:{}},r=e.path;let s;e.collectionGroup!==null?(s=r,t.structuredQuery.from=[{collectionId:e.collectionGroup,allDescendants:!0}]):(s=r.popLast(),t.structuredQuery.from=[{collectionId:r.lastSegment()}]),t.parent=Bf(n,s);const i=(function(f){if(f.length!==0)return jf(ot.create(f,"and"))})(e.filters);i&&(t.structuredQuery.where=i);const a=(function(f){if(f.length!==0)return f.map((d=>(function(I){return{field:jn(I.field),direction:aE(I.dir)}})(d)))})(e.orderBy);a&&(t.structuredQuery.orderBy=a);const c=na(n,e.limit);return c!==null&&(t.structuredQuery.limit=c),e.startAt&&(t.structuredQuery.startAt=(function(f){return{before:f.inclusive,values:f.position}})(e.startAt)),e.endAt&&(t.structuredQuery.endAt=(function(f){return{before:!f.inclusive,values:f.position}})(e.endAt)),{Lt:t,parent:s}}function sE(n){let e=Xy(n.parent);const t=n.structuredQuery,r=t.from?t.from.length:0;let s=null;if(r>0){U(r===1,65062);const d=t.from[0];d.allDescendants?s=d.collectionId:e=e.child(d.collectionId)}let i=[];t.where&&(i=(function(m){const I=$f(m);return I instanceof ot&&bf(I)?I.getFilters():[I]})(t.where));let a=[];t.orderBy&&(a=(function(m){return m.map((I=>(function(x){return new us(zn(x.field),(function(O){switch(O){case"ASCENDING":return"asc";case"DESCENDING":return"desc";default:return}})(x.direction))})(I)))})(t.orderBy));let c=null;t.limit&&(c=(function(m){let I;return I=typeof m=="object"?m.value:m,Gi(I)?null:I})(t.limit));let l=null;t.startAt&&(l=(function(m){const I=!!m.before,V=m.values||[];return new xi(V,I)})(t.startAt));let f=null;return t.endAt&&(f=(function(m){const I=!m.before,V=m.values||[];return new xi(V,I)})(t.endAt)),Ny(e,s,a,i,c,"F",l,f)}function iE(n,e){const t=(function(s){switch(s){case"TargetPurposeListen":return null;case"TargetPurposeExistenceFilterMismatch":return"existence-filter-mismatch";case"TargetPurposeExistenceFilterMismatchBloom":return"existence-filter-mismatch-bloom";case"TargetPurposeLimboResolution":return"limbo-document";default:return q(28987,{purpose:s})}})(e.purpose);return t==null?null:{"goog-listen-tags":t}}function oE(n,e){return{structuredPipeline:{pipeline:{stages:e.stages.map((t=>t._toProto(n)))}}}}function $f(n){return n.unaryFilter!==void 0?(function(t){switch(t.unaryFilter.op){case"IS_NAN":const r=zn(t.unaryFilter.field);return de.create(r,"==",{doubleValue:NaN});case"IS_NULL":const s=zn(t.unaryFilter.field);return de.create(s,"==",{nullValue:"NULL_VALUE"});case"IS_NOT_NAN":const i=zn(t.unaryFilter.field);return de.create(i,"!=",{doubleValue:NaN});case"IS_NOT_NULL":const a=zn(t.unaryFilter.field);return de.create(a,"!=",{nullValue:"NULL_VALUE"});case"OPERATOR_UNSPECIFIED":return q(61313);default:return q(60726)}})(n):n.fieldFilter!==void 0?(function(t){return de.create(zn(t.fieldFilter.field),(function(s){switch(s){case"EQUAL":return"==";case"NOT_EQUAL":return"!=";case"GREATER_THAN":return">";case"GREATER_THAN_OR_EQUAL":return">=";case"LESS_THAN":return"<";case"LESS_THAN_OR_EQUAL":return"<=";case"ARRAY_CONTAINS":return"array-contains";case"IN":return"in";case"NOT_IN":return"not-in";case"ARRAY_CONTAINS_ANY":return"array-contains-any";case"OPERATOR_UNSPECIFIED":return q(58110);default:return q(50506)}})(t.fieldFilter.op),t.fieldFilter.value)})(n):n.compositeFilter!==void 0?(function(t){return ot.create(t.compositeFilter.filters.map((r=>$f(r))),(function(s){switch(s){case"AND":return"and";case"OR":return"or";default:return q(1026)}})(t.compositeFilter.op))})(n):q(30097,{filter:n})}function aE(n){return Ky[n]}function cE(n){return Qy[n]}function uE(n){return Yy[n]}function jn(n){return{fieldPath:n.canonicalString()}}function zn(n){return Ye.fromServerFormat(n.fieldPath)}function jf(n){return n instanceof de?(function(t){if(t.op==="=="){if(Ae(t.value))return{unaryFilter:{field:jn(t.field),op:"IS_NAN"}};if(Qe(t.value))return{unaryFilter:{field:jn(t.field),op:"IS_NULL"}}}else if(t.op==="!="){if(Ae(t.value))return{unaryFilter:{field:jn(t.field),op:"IS_NOT_NAN"}};if(Qe(t.value))return{unaryFilter:{field:jn(t.field),op:"IS_NOT_NULL"}}}return{fieldFilter:{field:jn(t.field),op:cE(t.op),value:t.value}}})(n):n instanceof ot?(function(t){const r=t.getFilters().map((s=>jf(s)));return r.length===1?r[0]:{compositeFilter:{op:uE(t.op),filters:r}}})(n):q(54877,{filter:n})}function lE(n){const e=[];return n.fields.forEach((t=>e.push(t.canonicalString()))),{fieldPaths:e}}function zf(n){return n.length>=4&&n.get(0)==="projects"&&n.get(2)==="databases"}function Gf(n){return!!n&&typeof n._toProto=="function"&&n._protoValueType==="ProtoValue"}function hs(n,e){const t={fields:{}};return e.forEach(((r,s)=>{if(typeof s!="string")throw new Error(`Cannot encode map with non-string key: ${s}`);t.fields[s]=r._toProto(n)})),{mapValue:t}}function Wf(n){return{stringValue:n}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Ji(n){return new Jy(n,!0)}/**
 * @license
 * Copyright 2025 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class qa{constructor(e){this.value=e}isEqual(e){return this.value===e.value}}/**
 * @license
 * Copyright 2025 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class $a{constructor(e,t){if(this.seconds=e,this.increment=t,!Number.isInteger(e)||e<0||e>4294967295)throw new Error("BsonTimestamp 'seconds' must be in the range of a 32-bit unsigned integer (0-4294967295).");if(!Number.isInteger(t)||t<0||t>4294967295)throw new Error("BsonTimestamp 'increment' must be in the range of a 32-bit unsigned integer (0-4294967295).")}isEqual(e){return this.seconds===e.seconds&&this.increment===e.increment}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ke{constructor(e,t=0){if(this.subtype=t,!Number.isInteger(t)||t<0||t>255)throw new D(S.INVALID_ARGUMENT,"The subtype for Bytes must be a value in the inclusive [0, 255] range.");this._byteString=e}static fromBase64String(e,t=0){try{return new Ke(ae.fromBase64String(e),t)}catch(r){throw new D(S.INVALID_ARGUMENT,"Failed to construct data from Base64 string: "+r)}}static fromUint8Array(e,t=0){return new Ke(ae.fromUint8Array(e),t)}toBase64(){return this._byteString.toBase64()}toUint8Array(){return this._byteString.toUint8Array()}get data(){return this.toUint8Array()}toString(){return"Bytes(base64: "+this.toBase64()+", subtype: "+this.subtype+")"}isEqual(e){return this.subtype===e.subtype&&this._byteString.isEqual(e._byteString)}toJSON(){const e={type:Ke._jsonSchemaVersion,bytes:this.toBase64()};return this.subtype!==0&&(e.subtype=this.subtype),e}static fromJSON(e){if(bs(e,Ke._jsonSchema)){const t=e.subtype??0;return Ke.fromBase64String(e.bytes,t)}}}Ke._jsonSchemaVersion="firestore/bytes/1.0",Ke._jsonSchema={type:he("string",Ke._jsonSchemaVersion),bytes:he("string"),subtype:{...he("number"),optional:!0}};/**
 * @license
 * Copyright 2025 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ja{constructor(e){this.stringValue=e,this.value=B.fromString(e)}isEqual(e){return!(!this.value.oe()||!e.value.oe())||this.value.compareTo(e.value)===0}toJSON(){return{Ut:{stringValue:this.stringValue}}}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class za{constructor(...e){for(let t=0;t<e.length;++t)if(e[t].length===0)throw new D(S.INVALID_ARGUMENT,"Invalid field name at argument $(i + 1). Field names must not be empty.");this._internalPath=new Ye(e)}isEqual(e){return this._internalPath.isEqual(e._internalPath)}}function hE(){return new za(er)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ga{constructor(e){this._methodName=e}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class gt{constructor(e,t){if(!isFinite(e)||e<-90||e>90)throw new D(S.INVALID_ARGUMENT,"Latitude must be a number between -90 and 90, but was: "+e);if(!isFinite(t)||t<-180||t>180)throw new D(S.INVALID_ARGUMENT,"Longitude must be a number between -180 and 180, but was: "+t);this._lat=e,this._long=t}get latitude(){return this._lat}get longitude(){return this._long}isEqual(e){return this._lat===e._lat&&this._long===e._long}_compareTo(e){return Q(this._lat,e._lat)||Q(this._long,e._long)}toJSON(){return{latitude:this._lat,longitude:this._long,type:gt._jsonSchemaVersion}}static fromJSON(e){if(bs(e,gt._jsonSchema))return new gt(e.latitude,e.longitude)}}gt._jsonSchemaVersion="firestore/geoPoint/1.0",gt._jsonSchema={type:he("string",gt._jsonSchemaVersion),latitude:he("number"),longitude:he("number")};/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Wa{constructor(e){this.value=e}isEqual(e){return this.value===e.value}}/**
 * @license
 * Copyright 2025 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class vt{constructor(){this.type="MaxKey"}static instance(){return vt.MAX_KEY_VALUE_INSTANCE||(vt.MAX_KEY_VALUE_INSTANCE=new vt),vt.MAX_KEY_VALUE_INSTANCE}}vt.MAX_KEY_VALUE_INSTANCE=null;/**
 * @license
 * Copyright 2025 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class At{constructor(){this.type="MinKey"}static instance(){return At.MIN_KEY_VALUE_INSTANCE||(At.MIN_KEY_VALUE_INSTANCE=new At),At.MIN_KEY_VALUE_INSTANCE}}At.MIN_KEY_VALUE_INSTANCE=null;/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ce{constructor(e){this.uid=e}isAuthenticated(){return this.uid!=null}toKey(){return this.isAuthenticated()?"uid:"+this.uid:"anonymous-user"}isEqual(e){return e.uid===this.uid}}Ce.UNAUTHENTICATED=new Ce(null),Ce.GOOGLE_CREDENTIALS=new Ce("google-credentials-uid"),Ce.FIRST_PARTY=new Ce("first-party-uid"),Ce.MOCK_USER=new Ce("mock-user");/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Qt{constructor(){this.promise=new Promise(((e,t)=>{this.resolve=e,this.reject=t}))}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Hf{constructor(e,t){this.user=t,this.type="OAuth",this.headers=new Map,this.headers.set("Authorization",`Bearer ${e}`)}}class fE{getToken(){return Promise.resolve(null)}invalidateToken(){}start(e,t){e.enqueueRetryable((()=>t(Ce.UNAUTHENTICATED)))}shutdown(){}}class dE{constructor(e){this.token=e,this.changeListener=null}getToken(){return Promise.resolve(this.token)}invalidateToken(){}start(e,t){this.changeListener=t,e.enqueueRetryable((()=>t(this.token.user)))}shutdown(){this.changeListener=null}}class pE{constructor(e){this.kt=e,this.currentUser=Ce.UNAUTHENTICATED,this.Qt=0,this.forceRefresh=!1,this.auth=null}start(e,t){U(this.qt===void 0,42304);let r=this.Qt;const s=l=>this.Qt!==r?(r=this.Qt,t(l)):Promise.resolve();let i=new Qt;this.qt=()=>{this.Qt++,this.currentUser=this.Kt(),i.resolve(),i=new Qt,e.enqueueRetryable((()=>s(this.currentUser)))};const a=()=>{const l=i;e.enqueueRetryable((async()=>{await l.promise,await s(this.currentUser)}))},c=l=>{L("FirebaseAuthCredentialsProvider","Auth detected"),this.auth=l,this.qt&&(this.auth.addAuthTokenListener(this.qt),a())};this.kt.onInit((l=>c(l))),setTimeout((()=>{if(!this.auth){const l=this.kt.getImmediate({optional:!0});l?c(l):(L("FirebaseAuthCredentialsProvider","Auth not yet detected"),i.resolve(),i=new Qt)}}),0),a()}getToken(){const e=this.Qt,t=this.forceRefresh;return this.forceRefresh=!1,this.auth?this.auth.getToken(t).then((r=>this.Qt!==e?(L("FirebaseAuthCredentialsProvider","getToken aborted due to token change."),this.getToken()):r?(U(typeof r.accessToken=="string",31837,{Wt:r}),new Hf(r.accessToken,this.currentUser)):null)):Promise.resolve(null)}invalidateToken(){this.forceRefresh=!0}shutdown(){this.auth&&this.qt&&this.auth.removeAuthTokenListener(this.qt),this.qt=void 0}Kt(){const e=this.auth&&this.auth.getUid();return U(e===null||typeof e=="string",2055,{Gt:e}),new Ce(e)}}class mE{constructor(e,t,r){this.jt=e,this.zt=t,this.Ht=r,this.type="FirstParty",this.user=Ce.FIRST_PARTY,this.Jt=new Map}Yt(){return this.Ht?this.Ht():null}get headers(){this.Jt.set("X-Goog-AuthUser",this.jt);const e=this.Yt();return e&&this.Jt.set("Authorization",e),this.zt&&this.Jt.set("X-Goog-Iam-Authorization-Token",this.zt),this.Jt}}class gE{constructor(e,t,r){this.jt=e,this.zt=t,this.Ht=r}getToken(){return Promise.resolve(new mE(this.jt,this.zt,this.Ht))}start(e,t){e.enqueueRetryable((()=>t(Ce.FIRST_PARTY)))}shutdown(){}invalidateToken(){}}class Vl{constructor(e){this.value=e,this.type="AppCheck",this.headers=new Map,e&&e.length>0&&this.headers.set("x-firebase-appcheck",this.value)}}class _E{constructor(e,t){this.Zt=t,this.forceRefresh=!1,this.appCheck=null,this.Xt=null,this.en=null,tt(e)&&e.settings.appCheckToken&&(this.en=e.settings.appCheckToken)}start(e,t){U(this.qt===void 0,3512);const r=i=>{i.error!=null&&L("FirebaseAppCheckTokenProvider",`Error getting App Check token; using placeholder token instead. Error: ${i.error.message}`);const a=i.token!==this.Xt;return this.Xt=i.token,L("FirebaseAppCheckTokenProvider",`Received ${a?"new":"existing"} token.`),a?t(i.token):Promise.resolve()};this.qt=i=>{e.enqueueRetryable((()=>r(i)))};const s=i=>{L("FirebaseAppCheckTokenProvider","AppCheck detected"),this.appCheck=i,this.qt&&this.appCheck.addTokenListener(this.qt)};this.Zt.onInit((i=>s(i))),setTimeout((()=>{if(!this.appCheck){const i=this.Zt.getImmediate({optional:!0});i?s(i):L("FirebaseAppCheckTokenProvider","AppCheck not yet detected")}}),0)}getToken(){if(this.en)return Promise.resolve(new Vl(this.en));const e=this.forceRefresh;return this.forceRefresh=!1,this.appCheck?this.appCheck.getToken(e).then((t=>t?(U(typeof t.token=="string",44558,{tokenResult:t}),this.Xt=t.token,new Vl(t.token)):null)):Promise.resolve(null)}invalidateToken(){this.forceRefresh=!0}shutdown(){this.appCheck&&this.qt&&this.appCheck.removeTokenListener(this.qt),this.qt=void 0}}function Kf(n){const e={};return n.timeoutSeconds!==void 0&&(e.timeoutSeconds=n.timeoutSeconds),e}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class yE{tn(e){}shutdown(){}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Sl="ConnectivityMonitor";class Cl{constructor(){this.nn=()=>this.rn(),this.sn=()=>this._n(),this.an=[],this.un()}tn(e){this.an.push(e)}shutdown(){window.removeEventListener("online",this.nn),window.removeEventListener("offline",this.sn)}un(){window.addEventListener("online",this.nn),window.addEventListener("offline",this.sn)}rn(){L(Sl,"Network connectivity changed: AVAILABLE");for(const e of this.an)e(0)}_n(){L(Sl,"Network connectivity changed: UNAVAILABLE");for(const e of this.an)e(1)}static cn(){return typeof window<"u"&&window.addEventListener!==void 0&&window.removeEventListener!==void 0}}/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let ti=null;function oa(){return ti===null?ti=(function(){return 268435456+Math.round(2147483648*Math.random())})():ti++,"0x"+ti.toString(16)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Fo="RestConnection",EE={BatchGetDocuments:"batchGet",Commit:"commit",RunQuery:"runQuery",RunAggregationQuery:"runAggregationQuery",ExecutePipeline:"executePipeline"};class wE{get En(){return!1}constructor(e){this.databaseInfo=e,this.databaseId=e.databaseId;const t=e.ssl?"https":"http",r=encodeURIComponent(this.databaseId.projectId),s=encodeURIComponent(this.databaseId.database);this.hn=t+"://"+e.host,this.Tn=`projects/${r}/databases/${s}`,this.Pn=this.databaseId.database===vi?`project_id=${r}`:`project_id=${r}&database_id=${s}`}In(e,t,r,s,i){const a=oa(),c=this.Rn(e,t.toUriEncodedString());L(Fo,`Sending RPC '${e}' ${a}:`,c,r);const l={"google-cloud-resource-prefix":this.Tn,"x-goog-request-params":this.Pn};this.An(l,s,i);const{host:f}=new URL(c),d=ws(f);return this.Vn(e,c,l,r,d).then((m=>(L(Fo,`Received RPC '${e}' ${a}: `,m),m)),(m=>{throw it(Fo,`RPC '${e}' ${a} failed with error: `,m,"url: ",c,"request:",r),m}))}dn(e,t,r,s,i,a){return this.In(e,t,r,s,i)}An(e,t,r){if(e["X-Goog-Api-Client"]=(function(){return"gl-js/ fire/"+lr})(),e["Content-Type"]="text/plain",this.databaseInfo.appId&&(e["X-Firebase-GMPID"]=this.databaseInfo.appId),t&&t.headers.forEach(((s,i)=>e[i]=s)),r&&r.headers.forEach(((s,i)=>e[i]=s)),this.databaseInfo._customHeaders)for(const s of Object.keys(this.databaseInfo._customHeaders))e[s]=this.databaseInfo._customHeaders[s]}Rn(e,t){const r=EE[e];let s=`${this.hn}/v1/${t}:${r}`;return this.databaseInfo.apiKey&&(s=`${s}?key=${encodeURIComponent(this.databaseInfo.apiKey)}`),s}terminate(){}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class TE{constructor(e){this.fn=e.fn,this.mn=e.mn}pn(e){this.gn=e}yn(e){this.wn=e}bn(e){this.Sn=e}onMessage(e){this.xn=e}close(){this.mn()}send(e){this.fn(e)}vn(){this.gn()}Dn(){this.wn()}Cn(e){this.Sn(e)}Fn(e){this.xn(e)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Se="WebChannelConnection",Or=(n,e,t)=>{n.listen(e,(r=>{try{t(r)}catch(s){setTimeout((()=>{throw s}),0)}}))};class Qn extends wE{constructor(e){super(e),this.On=[],this.forceLongPolling=e.forceLongPolling,this.autoDetectLongPolling=e.autoDetectLongPolling,this.useFetchStreams=e.useFetchStreams,this.longPollingOptions=e.longPollingOptions}static Mn(){if(!Qn.Nn){const e=Qh();Or(e,Kh.STAT_EVENT,(t=>{t.stat===Qo.PROXY?L(Se,"STAT_EVENT: detected buffering proxy"):t.stat===Qo.NOPROXY&&L(Se,"STAT_EVENT: detected no buffering proxy")})),Qn.Nn=!0}}Vn(e,t,r,s,i){const a=oa();return new Promise(((c,l)=>{const f=new Wh;f.setWithCredentials(!0),f.listenOnce(Hh.COMPLETE,(()=>{try{switch(f.getLastErrorCode()){case ci.NO_ERROR:const m=f.getResponseJson();L(Se,`XHR for RPC '${e}' ${a} received:`,JSON.stringify(m)),c(m);break;case ci.TIMEOUT:L(Se,`RPC '${e}' ${a} timed out`),l(new D(S.DEADLINE_EXCEEDED,"Request time out"));break;case ci.HTTP_ERROR:const I=f.getStatus();if(L(Se,`RPC '${e}' ${a} failed with status:`,I,"response text:",f.getResponseText()),I>0){let V=f.getResponseJson();Array.isArray(V)&&(V=V[0]);const x=V==null?void 0:V.error;if(x&&x.status&&x.message){const M=(function(W){const J=W.toLowerCase().replace(/_/g,"-");return Object.values(S).indexOf(J)>=0?J:S.UNKNOWN})(x.status);l(new D(M,x.message))}else l(new D(S.UNKNOWN,"Server responded with status "+f.getStatus()))}else l(new D(S.UNAVAILABLE,"Connection failed."));break;default:q(9055,{Bn:e,streamId:a,Ln:f.getLastErrorCode(),$n:f.getLastError()})}}finally{L(Se,`RPC '${e}' ${a} completed.`)}}));const d=JSON.stringify(s);L(Se,`RPC '${e}' ${a} sending request:`,s),f.send(t,"POST",d,r,15)}))}Un(e,t,r){const s=oa(),i=[this.hn,"/","google.firestore.v1.Firestore","/",e,"/channel"],a=this.createWebChannelTransport(),c={httpSessionIdParam:"gsessionid",initMessageHeaders:{},messageUrlParams:{database:`projects/${this.databaseId.projectId}/databases/${this.databaseId.database}`},sendRawJson:!0,supportsCrossDomainXhr:!0,internalChannelParams:{forwardChannelRequestTimeoutMs:6e5},forceLongPolling:this.forceLongPolling,detectBufferingProxy:this.autoDetectLongPolling},l=this.longPollingOptions.timeoutSeconds;l!==void 0&&(c.longPollingTimeout=Math.round(1e3*l)),this.useFetchStreams&&(c.useFetchStreams=!0),this.An(c.initMessageHeaders,t,r),c.encodeInitMessageHeaders=!0;const f=i.join("");L(Se,`Creating RPC '${e}' stream ${s}: ${f}`,c);const d=a.createWebChannel(f,c);this.kn(d);let m=!1,I=!1;const V=new TE({fn:x=>{I?L(Se,`Not sending because RPC '${e}' stream ${s} is closed:`,x):(m||(L(Se,`Opening RPC '${e}' stream ${s} transport.`),d.open(),m=!0),L(Se,`RPC '${e}' stream ${s} sending:`,x),d.send(x))},mn:()=>d.close()});return Or(d,Lr.EventType.OPEN,(()=>{I||(L(Se,`RPC '${e}' stream ${s} transport opened.`),V.vn())})),Or(d,Lr.EventType.CLOSE,(()=>{I||(I=!0,L(Se,`RPC '${e}' stream ${s} transport closed`),V.Cn(),this.Qn(d))})),Or(d,Lr.EventType.ERROR,(x=>{I||(I=!0,it(Se,`RPC '${e}' stream ${s} transport errored. Name:`,x.name,"Message:",x.message),V.Cn(new D(S.UNAVAILABLE,"The operation could not be completed")))})),Or(d,Lr.EventType.MESSAGE,(x=>{var M;if(!I){const O=x.data[0];U(!!O,16349);const W=O,J=(W==null?void 0:W.error)||((M=W[0])==null?void 0:M.error);if(J){L(Se,`RPC '${e}' stream ${s} received error:`,J);const se=J.status;let De=(function(T){const g=fe[T];if(g!==void 0)return kf(g)})(se),ge=J.message;se==="NOT_FOUND"&&ge.includes("database")&&ge.includes("does not exist")&&ge.includes(this.databaseId.database)&&it(`Database '${this.databaseId.database}' not found. Please check your project configuration.`),De===void 0&&(De=S.INTERNAL,ge="Unknown error status: "+se+" with message "+J.message),I=!0,V.Cn(new D(De,ge)),d.close()}else L(Se,`RPC '${e}' stream ${s} received:`,O),V.Fn(O)}})),Qn.Mn(),setTimeout((()=>{V.Dn()}),0),V}terminate(){this.On.forEach((e=>e.close())),this.On=[]}kn(e){this.On.push(e)}Qn(e){this.On=this.On.filter((t=>t===e))}An(e,t,r){super.An(e,t,r),this.databaseInfo.apiKey&&(e["x-goog-api-key"]=this.databaseInfo.apiKey)}createWebChannelTransport(){return Yh()}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function IE(n){return new Qn(n)}Qn.Nn=!1;class Qf{constructor(e,t,r=1e3,s=1.5,i=6e4){this.qn=e,this.timerId=t,this.Kn=r,this.Wn=s,this.Gn=i,this.jn=0,this.zn=null,this.Hn=Date.now(),this.reset()}reset(){this.jn=0}Jn(){this.jn=this.Gn}Yn(e){this.cancel();const t=Math.floor(this.jn+this.Zn()),r=Math.max(0,Date.now()-this.Hn),s=Math.max(0,t-r);s>0&&L("ExponentialBackoff",`Backing off for ${s} ms (base delay: ${this.jn} ms, delay with jitter: ${t} ms, last attempt: ${r} ms ago)`),this.zn=this.qn.enqueueAfterDelay(this.timerId,s,(()=>(this.Hn=Date.now(),e()))),this.jn*=this.Wn,this.jn<this.Kn&&(this.jn=this.Kn),this.jn>this.Gn&&(this.jn=this.Gn)}Xn(){this.zn!==null&&(this.zn.skipDelay(),this.zn=null)}cancel(){this.zn!==null&&(this.zn.cancel(),this.zn=null)}Zn(){return(Math.random()-.5)*this.jn}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const xl="PersistentStream";class Yf{constructor(e,t,r,s,i,a,c,l){this.qn=e,this.er=r,this.tr=s,this.connection=i,this.authCredentialsProvider=a,this.appCheckCredentialsProvider=c,this.listener=l,this.state=0,this.nr=0,this.rr=null,this.ir=null,this.stream=null,this.sr=0,this._r=new Qf(e,t)}ar(){return this.state===1||this.state===5||this.ur()}ur(){return this.state===2||this.state===3}start(){this.sr=0,this.state!==4?this.auth():this.cr()}async stop(){this.ar()&&await this.close(0)}lr(){this.state=0,this._r.reset()}Er(){this.ur()&&this.rr===null&&(this.rr=this.qn.enqueueAfterDelay(this.er,6e4,(()=>this.hr())))}Tr(e){this.Pr(),this.stream.send(e)}async hr(){if(this.ur())return this.close(0)}Pr(){this.rr&&(this.rr.cancel(),this.rr=null)}Ir(){this.ir&&(this.ir.cancel(),this.ir=null)}async close(e,t){this.Pr(),this.Ir(),this._r.cancel(),this.nr++,e!==4?this._r.reset():t&&t.code===S.RESOURCE_EXHAUSTED?(Ct(t.toString()),Ct("Using maximum backoff delay to prevent overloading the backend."),this._r.Jn()):t&&t.code===S.UNAUTHENTICATED&&this.state!==3&&(this.authCredentialsProvider.invalidateToken(),this.appCheckCredentialsProvider.invalidateToken()),this.stream!==null&&(this.Rr(),this.stream.close(),this.stream=null),this.state=e,await this.listener.bn(t)}Rr(){}auth(){this.state=1;const e=this.Ar(this.nr),t=this.nr;Promise.all([this.authCredentialsProvider.getToken(),this.appCheckCredentialsProvider.getToken()]).then((([r,s])=>{this.nr===t&&this.Vr(r,s)}),(r=>{e((()=>{const s=new D(S.UNKNOWN,"Fetching auth token failed: "+r.message);return this.dr(s)}))}))}Vr(e,t){const r=this.Ar(this.nr);this.stream=this.mr(e,t),this.stream.pn((()=>{r((()=>this.listener.pn()))})),this.stream.yn((()=>{r((()=>(this.state=2,this.ir=this.qn.enqueueAfterDelay(this.tr,1e4,(()=>(this.ur()&&(this.state=3),Promise.resolve()))),this.listener.yn())))})),this.stream.bn((s=>{r((()=>this.dr(s)))})),this.stream.onMessage((s=>{r((()=>++this.sr==1?this.pr(s):this.onNext(s)))}))}cr(){this.state=5,this._r.Yn((async()=>{this.state=0,this.start()}))}dr(e){return L(xl,`close with error: ${e}`),this.stream=null,this.close(4,e)}Ar(e){return t=>{this.qn.enqueueAndForget((()=>this.nr===e?t():(L(xl,"stream callback skipped by getCloseGuardedDispatcher."),Promise.resolve())))}}}class vE extends Yf{constructor(e,t,r,s,i,a){super(e,"listen_stream_connection_backoff","listen_stream_idle","health_check_timeout",t,r,s,a),this.serializer=i}mr(e,t){return this.connection.Un("Listen",e,t)}pr(e){return this.onNext(e)}onNext(e){this._r.reset();const t=Zy(this.serializer,e),r=(function(i){if(!("targetChange"in i))return G.min();const a=i.targetChange;return a.targetIds&&a.targetIds.length?G.min():a.readTime?mt(a.readTime):G.min()})(e);return this.listener.gr(t,r)}yr(e){const t={};t.database=ia(this.serializer),t.addTarget=(function(i,a){let c;const l=a.target;if(c=_n(l)?{pipelineQuery:oE(i,l)}:xf(l)?{documents:nE(i,l)}:{query:rE(i,l).Lt},c.targetId=a.targetId,a.resumeToken.approximateByteSize()>0){c.resumeToken=ra(i,a.resumeToken);const f=na(i,a.expectedCount);f!==null&&(c.expectedCount=f)}else if(a.snapshotVersion.compareTo(G.min())>0){c.readTime=Hr(i,a.snapshotVersion.toTimestamp());const f=na(i,a.expectedCount);f!==null&&(c.expectedCount=f)}return c})(this.serializer,e);const r=iE(this.serializer,e);r&&(t.labels=r),this.Tr(t)}wr(e){const t={};t.database=ia(this.serializer),t.removeTarget=e,this.Tr(t)}}class AE extends Yf{constructor(e,t,r,s,i,a){super(e,"write_stream_connection_backoff","write_stream_idle","health_check_timeout",t,r,s,a),this.serializer=i}get br(){return this.sr>0}start(){this.lastStreamToken=void 0,super.start()}Rr(){this.br&&this.Sr([])}mr(e,t){return this.connection.Un("Write",e,t)}pr(e){return U(!!e.streamToken,31322),this.lastStreamToken=e.streamToken,U(!e.writeResults||e.writeResults.length===0,55816),this.listener.vr()}onNext(e){U(!!e.streamToken,12678),this.lastStreamToken=e.streamToken,this._r.reset();const t=tE(e.writeResults,e.commitTime),r=mt(e.commitTime);return this.listener.Dr(r,t)}Cr(){const e={};e.database=ia(this.serializer),this.Tr(e)}Sr(e){const t={streamToken:this.lastStreamToken,writes:e.map((r=>eE(this.serializer,r)))};this.Tr(t)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class bE{}class RE extends bE{constructor(e,t,r,s){super(),this.authCredentials=e,this.appCheckCredentials=t,this.connection=r,this.serializer=s,this.Fr=!1}Or(){if(this.Fr)throw new D(S.FAILED_PRECONDITION,"The client has already been terminated.")}In(e,t,r,s){return this.Or(),Promise.all([this.authCredentials.getToken(),this.appCheckCredentials.getToken()]).then((([i,a])=>this.connection.In(e,sa(t,r),s,i,a))).catch((i=>{throw i.name==="FirebaseError"?(i.code===S.UNAUTHENTICATED&&(this.authCredentials.invalidateToken(),this.appCheckCredentials.invalidateToken()),i):new D(S.UNKNOWN,i.toString())}))}dn(e,t,r,s,i){return this.Or(),Promise.all([this.authCredentials.getToken(),this.appCheckCredentials.getToken()]).then((([a,c])=>this.connection.dn(e,sa(t,r),s,a,c,i))).catch((a=>{throw a.name==="FirebaseError"?(a.code===S.UNAUTHENTICATED&&(this.authCredentials.invalidateToken(),this.appCheckCredentials.invalidateToken()),a):new D(S.UNKNOWN,a.toString())}))}terminate(){this.Fr=!0,this.connection.terminate()}}function PE(n,e,t,r){return new RE(n,e,t,r)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const VE="ComponentProvider",Nl=new Map;function SE(n,e,t,r,s){return new iy(n,e,t,s.host,s.ssl,s.experimentalForceLongPolling,s.experimentalAutoDetectLongPolling,Kf(s.experimentalLongPollingOptions),s.useFetchStreams,s.isUsingEmulator,r,s._customHeaders,s.grpcFlowControlWindow)}/**
 * @license
 * Copyright 2018 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const kl={didRun:!1,sequenceNumbersCollected:0,targetsRemoved:0,documentsRemoved:0},Jf=41943040;class Ue{static withCacheSize(e){return new Ue(e,Ue.DEFAULT_COLLECTION_PERCENTILE,Ue.DEFAULT_MAX_SEQUENCE_NUMBERS_TO_COLLECT)}constructor(e,t,r){this.cacheSizeCollectionThreshold=e,this.percentileToCollect=t,this.maximumSequenceNumbersToCollect=r}}Ue.DEFAULT_COLLECTION_PERCENTILE=10,Ue.DEFAULT_MAX_SEQUENCE_NUMBERS_TO_COLLECT=1e3,Ue.DEFAULT=new Ue(Jf,Ue.DEFAULT_COLLECTION_PERCENTILE,Ue.DEFAULT_MAX_SEQUENCE_NUMBERS_TO_COLLECT),Ue.DISABLED=new Ue(-1,0,0);/**
 * @license
 * Copyright 2018 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Xi{constructor(e,t){this.previousValue=e,t&&(t.sequenceNumberHandler=r=>this.Mr(r),this.Nr=r=>t.writeSequenceNumber(r))}Mr(e){return this.previousValue=Math.max(e,this.previousValue),this.previousValue}next(){const e=++this.previousValue;return this.Nr&&this.Nr(e),e}}Xi.Br=-1;/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const CE="The current tab is not in the required state to perform this operation. It might be necessary to refresh the browser tab.";class xE{constructor(){this.onCommittedListeners=[]}addOnCommittedListener(e){this.onCommittedListeners.push(e)}raiseOnCommittedEvent(){this.onCommittedListeners.forEach((e=>e()))}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function fr(n){if(n.code!==S.FAILED_PRECONDITION||n.message!==CE)throw n;L("LocalStore","Unexpectedly lost primary lease")}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class C{constructor(e){this.nextCallback=null,this.catchCallback=null,this.result=void 0,this.error=void 0,this.isDone=!1,this.callbackAttached=!1,e((t=>{this.isDone=!0,this.result=t,this.nextCallback&&this.nextCallback(t)}),(t=>{this.isDone=!0,this.error=t,this.catchCallback&&this.catchCallback(t)}))}catch(e){return this.next(void 0,e)}next(e,t){return this.callbackAttached&&q(59440),this.callbackAttached=!0,this.isDone?this.error?this.wrapFailure(t,this.error):this.wrapSuccess(e,this.result):new C(((r,s)=>{this.nextCallback=i=>{this.wrapSuccess(e,i).next(r,s)},this.catchCallback=i=>{this.wrapFailure(t,i).next(r,s)}}))}toPromise(){return new Promise(((e,t)=>{this.next(e,t)}))}wrapUserFunction(e){try{const t=e();return t instanceof C?t:C.resolve(t)}catch(t){return C.reject(t)}}wrapSuccess(e,t){return e?this.wrapUserFunction((()=>e(t))):C.resolve(t)}wrapFailure(e,t){return e?this.wrapUserFunction((()=>e(t))):C.reject(t)}static resolve(e){return new C(((t,r)=>{t(e)}))}static reject(e){return new C(((t,r)=>{r(e)}))}static waitFor(e){return new C(((t,r)=>{let s=0,i=0,a=!1;e.forEach((c=>{++s,c.next((()=>{++i,a&&i===s&&t()}),(l=>r(l)))})),a=!0,i===s&&t()}))}static or(e){let t=C.resolve(!1);for(const r of e)t=t.next((s=>s?C.resolve(s):r()));return t}static forEach(e,t){const r=[];return e.forEach(((s,i)=>{r.push(t.call(this,s,i))})),this.waitFor(r)}static mapArray(e,t){return new C(((r,s)=>{const i=e.length,a=new Array(i);let c=0;for(let l=0;l<i;l++){const f=l;t(e[f]).next((d=>{a[f]=d,++c,c===i&&r(a)}),(d=>s(d)))}}))}static doWhile(e,t){return new C(((r,s)=>{const i=()=>{e()===!0?t().next((()=>{i()}),s):r()};i()}))}}function NE(n){const e=n.match(/Android ([\d.]+)/i),t=e?e[1].split(".").slice(0,2).join("."):"-1";return Number(t)}function dr(n){return n.name==="IndexedDbTransactionError"}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Dl="LruGarbageCollector",kE=1048576;function Ol([n,e],[t,r]){const s=Q(n,t);return s===0?Q(e,r):s}class DE{constructor(e){this.ai=e,this.buffer=new pe(Ol),this.ui=0}ci(){return++this.ui}li(e){const t=[e,this.ci()];if(this.buffer.size<this.ai)this.buffer=this.buffer.add(t);else{const r=this.buffer.last();Ol(t,r)<0&&(this.buffer=this.buffer.delete(r).add(t))}}get maxValue(){return this.buffer.last()[0]}}class OE{constructor(e,t,r){this.garbageCollector=e,this.asyncQueue=t,this.localStore=r,this.Ei=null}start(){this.garbageCollector.params.cacheSizeCollectionThreshold!==-1&&this.hi(6e4)}stop(){this.Ei&&(this.Ei.cancel(),this.Ei=null)}get started(){return this.Ei!==null}hi(e){L(Dl,`Garbage collection scheduled in ${e}ms`),this.Ei=this.asyncQueue.enqueueAfterDelay("lru_garbage_collection",e,(async()=>{this.Ei=null;try{await this.localStore.collectGarbage(this.garbageCollector)}catch(t){dr(t)?L(Dl,"Ignoring IndexedDB error during garbage collection: ",t):await fr(t)}await this.hi(3e5)}))}}class LE{constructor(e,t){this.Ti=e,this.params=t}calculateTargetCount(e,t){return this.Ti.Pi(e).next((r=>Math.floor(t/100*r)))}nthSequenceNumber(e,t){if(t===0)return C.resolve(Xi.Br);const r=new DE(t);return this.Ti.forEachTarget(e,(s=>r.li(s.sequenceNumber))).next((()=>this.Ti.Ii(e,(s=>r.li(s))))).next((()=>r.maxValue))}removeTargets(e,t,r){return this.Ti.removeTargets(e,t,r)}removeOrphanedDocuments(e,t){return this.Ti.removeOrphanedDocuments(e,t)}collect(e,t){return this.params.cacheSizeCollectionThreshold===-1?(L("LruGarbageCollector","Garbage collection skipped; disabled"),C.resolve(kl)):this.getCacheSize(e).next((r=>r<this.params.cacheSizeCollectionThreshold?(L("LruGarbageCollector",`Garbage collection skipped; Cache size ${r} is lower than threshold ${this.params.cacheSizeCollectionThreshold}`),kl):this.Ri(e,t)))}getCacheSize(e){return this.Ti.getCacheSize(e)}Ri(e,t){let r,s,i,a,c,l,f;const d=Date.now();return this.calculateTargetCount(e,this.params.percentileToCollect).next((m=>(m>this.params.maximumSequenceNumbersToCollect?(L("LruGarbageCollector",`Capping sequence numbers to collect down to the maximum of ${this.params.maximumSequenceNumbersToCollect} from ${m}`),s=this.params.maximumSequenceNumbersToCollect):s=m,a=Date.now(),this.nthSequenceNumber(e,s)))).next((m=>(r=m,c=Date.now(),this.removeTargets(e,r,t)))).next((m=>(i=m,l=Date.now(),this.removeOrphanedDocuments(e,r)))).next((m=>(f=Date.now(),Bn()<=X.DEBUG&&L("LruGarbageCollector",`LRU Garbage Collection
	Counted targets in ${a-d}ms
	Determined least recently used ${s} in `+(c-a)+`ms
	Removed ${i} targets in `+(l-c)+`ms
	Removed ${m} documents in `+(f-l)+`ms
Total Duration: ${f-d}ms`),C.resolve({didRun:!0,sequenceNumbersCollected:s,targetsRemoved:i,documentsRemoved:m}))))}}function ME(n,e){return new LE(n,e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Xf="firestore.googleapis.com",Ll=!0;class Ml{constructor(e){if(e.host===void 0){if(e.ssl!==void 0)throw new D(S.INVALID_ARGUMENT,"Can't provide ssl option if host option is not set");this.host=Xf,this.ssl=Ll}else this.host=e.host,this.ssl=e.ssl??Ll;if(this.isUsingEmulator=e.emulatorOptions!==void 0,this.credentials=e.credentials,this.ignoreUndefinedProperties=!!e.ignoreUndefinedProperties,this.localCache=e.localCache,e._customHeaders&&(this._customHeaders={...e._customHeaders}),e.cacheSizeBytes===void 0)this.cacheSizeBytes=Jf;else{if(e.cacheSizeBytes!==-1&&e.cacheSizeBytes<kE)throw new D(S.INVALID_ARGUMENT,"cacheSizeBytes must be at least 1048576");this.cacheSizeBytes=e.cacheSizeBytes}if(ry("experimentalForceLongPolling",e.experimentalForceLongPolling,"experimentalAutoDetectLongPolling",e.experimentalAutoDetectLongPolling),this.experimentalForceLongPolling=!!e.experimentalForceLongPolling,this.experimentalForceLongPolling?this.experimentalAutoDetectLongPolling=!1:e.experimentalAutoDetectLongPolling===void 0?this.experimentalAutoDetectLongPolling=!0:this.experimentalAutoDetectLongPolling=!!e.experimentalAutoDetectLongPolling,this.experimentalLongPollingOptions=Kf(e.experimentalLongPollingOptions??{}),(function(r){if(r.timeoutSeconds!==void 0){if(isNaN(r.timeoutSeconds))throw new D(S.INVALID_ARGUMENT,`invalid long polling timeout: ${r.timeoutSeconds} (must not be NaN)`);if(r.timeoutSeconds<5)throw new D(S.INVALID_ARGUMENT,`invalid long polling timeout: ${r.timeoutSeconds} (minimum allowed value is 5)`);if(r.timeoutSeconds>30)throw new D(S.INVALID_ARGUMENT,`invalid long polling timeout: ${r.timeoutSeconds} (maximum allowed value is 30)`)}})(this.experimentalLongPollingOptions),this.useFetchStreams=!!e.useFetchStreams,e.grpcFlowControlWindow!==void 0){if(typeof e.grpcFlowControlWindow!="number"||e.grpcFlowControlWindow<=0||e.grpcFlowControlWindow>2147483647||!Number.isInteger(e.grpcFlowControlWindow))throw new D(S.INVALID_ARGUMENT,"grpcFlowControlWindow must be a positive integer and cannot exceed 2147483647");this.grpcFlowControlWindow=e.grpcFlowControlWindow}}isEqual(e){return this.host===e.host&&this.ssl===e.ssl&&this.credentials===e.credentials&&this.cacheSizeBytes===e.cacheSizeBytes&&this.experimentalForceLongPolling===e.experimentalForceLongPolling&&this.experimentalAutoDetectLongPolling===e.experimentalAutoDetectLongPolling&&(function(r,s){return r.timeoutSeconds===s.timeoutSeconds})(this.experimentalLongPollingOptions,e.experimentalLongPollingOptions)&&this.ignoreUndefinedProperties===e.ignoreUndefinedProperties&&this.useFetchStreams===e.useFetchStreams&&this.grpcFlowControlWindow===e.grpcFlowControlWindow&&(function(r,s){if(r===s)return!0;if(!r||!s)return!1;const i=Object.keys(r),a=Object.keys(s);if(i.length!==a.length)return!1;for(const c of i)if(r[c]!==s[c])return!1;return!0})(this._customHeaders,e._customHeaders)}}let Zi=class{constructor(e,t,r,s){this._authCredentials=e,this._appCheckCredentials=t,this._databaseId=r,this._app=s,this.type="firestore-lite",this._persistenceKey="(lite)",this._settings=new Ml({}),this._settingsFrozen=!1,this._emulatorOptions={},this._terminateTask="notTerminated"}get app(){if(!this._app)throw new D(S.FAILED_PRECONDITION,"Firestore was not initialized using the Firebase SDK. 'app' is not available");return this._app}get _initialized(){return this._settingsFrozen}get _terminated(){return this._terminateTask!=="notTerminated"}_setSettings(e){if(this._settingsFrozen)throw new D(S.FAILED_PRECONDITION,"Firestore has already been started and its settings can no longer be changed. You can only modify settings before calling any other methods on a Firestore object.");this._settings=new Ml(e),this._emulatorOptions=e.emulatorOptions||{},e.credentials!==void 0&&(this._authCredentials=(function(r){if(!r)return new fE;switch(r.type){case"firstParty":return new gE(r.sessionIndex||"0",r.iamToken||null,r.authTokenFactory||null);case"provider":return r.client;default:throw new D(S.INVALID_ARGUMENT,"makeAuthCredentialsProvider failed due to invalid credential type")}})(e.credentials))}_getSettings(){return this._settings}_getEmulatorOptions(){return this._emulatorOptions}_freezeSettings(){return this._settingsFrozen=!0,this._settings}_delete(){return this._terminateTask==="notTerminated"&&(this._terminateTask=this._terminate()),this._terminateTask}async _restart(){this._terminateTask==="notTerminated"?await this._terminate():this._terminateTask="notTerminated"}toJSON(){return{app:this._app,databaseId:this._databaseId,settings:this._settings}}_terminate(){return(function(t){const r=Nl.get(t);r&&(L(VE,"Removing Datastore"),Nl.delete(t),r.terminate())})(this),Promise.resolve()}};function UE(n,e,t,r={}){var f;n=Rt(n,Zi);const s=ws(e),i=n._getSettings(),a={...i,emulatorOptions:n._getEmulatorOptions()},c=`${e}:${t}`;s&&uh(`https://${c}`),i.host!==Xf&&i.host!==c&&it("Host has been set in both settings() and connectFirestoreEmulator(), emulator host will be used.");const l={...i,host:c,ssl:s,emulatorOptions:r};if(!bn(l,a)&&(n._setSettings(l),r.mockUserToken)){let d,m;if(typeof r.mockUserToken=="string")d=r.mockUserToken,m=Ce.MOCK_USER;else{d=Bp(r.mockUserToken,(f=n._app)==null?void 0:f.options.projectId);const I=r.mockUserToken.sub||r.mockUserToken.user_id;if(!I)throw new D(S.INVALID_ARGUMENT,"mockUserToken must contain 'sub' or 'user_id' field!");m=new Ce(I)}n._authCredentials=new dE(new Hf(d,m))}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class un{constructor(e,t,r){this.converter=t,this._query=r,this.type="query",this.firestore=e}withConverter(e){return new un(this.firestore,e,this._query)}}class le{constructor(e,t,r){this.converter=t,this._key=r,this.type="document",this.firestore=e}get _path(){return this._key.path}get id(){return this._key.path.lastSegment()}get path(){return this._key.path.canonicalString()}get parent(){return new Yt(this.firestore,this.converter,this._key.path.popLast())}withConverter(e){return new le(this.firestore,e,this._key)}toJSON(){return{type:le._jsonSchemaVersion,referencePath:this._key.toString()}}static fromJSON(e,t,r){if(bs(t,le._jsonSchema))return new le(e,r||null,new F(ee.fromString(t.referencePath)))}}le._jsonSchemaVersion="firestore/documentReference/1.0",le._jsonSchema={type:he("string",le._jsonSchemaVersion),referencePath:he("string")};class Yt extends un{constructor(e,t,r){super(e,t,Qi(r)),this._path=r,this.type="collection"}get id(){return this._query.path.lastSegment()}get path(){return this._query.path.canonicalString()}get parent(){const e=this._path.popLast();return e.isEmpty()?null:new le(this.firestore,null,new F(e))}withConverter(e){return new Yt(this.firestore,e,this._path)}}function eI(n,e,...t){if(n=$e(n),Zh("collection","path",e),n instanceof Zi){const r=ee.fromString(e,...t);return il(r),new Yt(n,null,r)}{if(!(n instanceof le||n instanceof Yt))throw new D(S.INVALID_ARGUMENT,"Expected first argument to collection() to be a CollectionReference, a DocumentReference or FirebaseFirestore");const r=n._path.child(ee.fromString(e,...t));return il(r),new Yt(n.firestore,null,r)}}function FE(n,e,...t){if(n=$e(n),arguments.length===1&&(e=Va.newId()),Zh("doc","path",e),n instanceof Zi){const r=ee.fromString(e,...t);return sl(r),new le(n,null,new F(r))}{if(!(n instanceof le||n instanceof Yt))throw new D(S.INVALID_ARGUMENT,"Expected first argument to doc() to be a CollectionReference, a DocumentReference or FirebaseFirestore");const r=n._path.child(ee.fromString(e,...t));return sl(r),new le(n.firestore,n instanceof Yt?n.converter:null,new F(r))}}/**
 * @license
 * Copyright 2025 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ha{constructor(e,t){this.pattern=e,this.options=t}isEqual(e){return this.pattern===e.pattern&&this.options===e.options}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *//**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class qe{constructor(e){this._values=(e||[]).map((t=>t))}toArray(){return this._values.map((e=>e))}isEqual(e){return(function(r,s){if(r.length!==s.length)return!1;for(let i=0;i<r.length;++i)if(r[i]!==s[i])return!1;return!0})(this._values,e._values)}toJSON(){return{type:qe._jsonSchemaVersion,vectorValues:this._values}}static fromJSON(e){if(bs(e,qe._jsonSchema)){if(Array.isArray(e.vectorValues)&&e.vectorValues.every((t=>typeof t=="number")))return new qe(e.vectorValues);throw new D(S.INVALID_ARGUMENT,"Expected 'vectorValues' field to be a number array")}}}qe._jsonSchemaVersion="firestore/vectorValue/1.0",qe._jsonSchema={type:he("string",qe._jsonSchemaVersion),vectorValues:he("object")};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const BE=/^__.*__$/;class qE{constructor(e,t,r){this.data=e,this.fieldMask=t,this.fieldTransforms=r}toMutation(e,t){return this.fieldMask!==null?new kn(e,this.data,this.fieldMask,t,this.fieldTransforms):new Ps(e,this.data,t,this.fieldTransforms)}}function Zf(n){switch(n){case 0:case 2:case 1:return!0;case 3:case 4:return!1;default:throw q(40011,{dataSource:n})}}class Ka{constructor(e,t,r,s,i,a){this.settings=e,this.databaseId=t,this.serializer=r,this.ignoreUndefinedProperties=s,i===void 0&&this.validatePath(),this.fieldTransforms=i||[],this.fieldMask=a||[]}get path(){return this.settings.path}get dataSource(){return this.settings.dataSource}contextWith(e){return new Ka({...this.settings,...e},this.databaseId,this.serializer,this.ignoreUndefinedProperties,this.fieldTransforms,this.fieldMask)}childContextForField(e){var s;const t=(s=this.path)==null?void 0:s.child(e),r=this.contextWith({path:t,arrayElement:!1});return r.validatePathSegment(e),r}childContextForFieldPath(e){var s;const t=(s=this.path)==null?void 0:s.child(e),r=this.contextWith({path:t,arrayElement:!1});return r.validatePath(),r}childContextForArray(e){return this.contextWith({path:void 0,arrayElement:!0})}createError(e){return Di(e,this.settings.methodName,this.settings.hasConverter||!1,this.path,this.settings.targetDoc)}contains(e){return this.fieldMask.find((t=>e.isPrefixOf(t)))!==void 0||this.fieldTransforms.find((t=>e.isPrefixOf(t.field)))!==void 0}validatePath(){if(this.path)for(let e=0;e<this.path.length;e++)this.validatePathSegment(this.path.get(e))}validatePathSegment(e){if(e.length===0)throw this.createError("Document fields must not be empty");if(Zf(this.dataSource)&&BE.test(e))throw this.createError('Document fields cannot begin and end with "__"')}}class $E{constructor(e,t,r){this.databaseId=e,this.ignoreUndefinedProperties=t,this.serializer=r||Ji(e)}createContext(e,t,r,s=!1){return new Ka({dataSource:e,methodName:t,targetDoc:r,path:Ye.emptyPath(),arrayElement:!1,hasConverter:s},this.databaseId,this.serializer,this.ignoreUndefinedProperties)}}function Qa(n){const e=n._freezeSettings(),t=Ji(n._databaseId);return new $E(n._databaseId,!!e.ignoreUndefinedProperties,t)}function ed(n,e,t,r,s,i={}){const a=n.createContext(i.merge||i.mergeFields?2:0,e,t,s);sd("Data must be an object, but it was:",a,r);const c=td(r,a);let l,f;if(i.merge)l=new rt(a.fieldMask),f=a.fieldTransforms;else if(i.mergeFields){const d=[];for(const m of i.mergeFields){const I=Cs(e,m,t);if(!a.contains(I))throw new D(S.INVALID_ARGUMENT,`Field '${I}' is specified in your field mask but missing from your input data.`);WE(d,I)||d.push(I)}l=new rt(d),f=a.fieldTransforms.filter((m=>l.covers(m.field)))}else l=null,f=a.fieldTransforms;return new qE(new He(c),l,f)}class Ya extends Ga{_toFieldTransform(e){return new dy(e.path,new is)}isEqual(e){return e instanceof Ya}}function jE(n,e,t,r=!1){return ir(t,n.createContext(r?4:3,e))}function ir(n,e,t){if(rd(n=$e(n)))return sd("Unsupported field value:",e,n),td(n,e);if(n instanceof Ga)return(function(s,i){if(!Zf(i.dataSource))throw i.createError(`${s._methodName}() can only be used with update() and set()`);if(!i.path)throw i.createError(`${s._methodName}() is not currently supported inside arrays`);const a=s._toFieldTransform(i);a&&i.fieldTransforms.push(a)})(n,e),null;if(n===void 0&&e.ignoreUndefinedProperties)return null;if(e.path&&e.fieldMask.push(e.path),n instanceof Array){if(e.settings.arrayElement&&e.dataSource!==4)throw e.createError("Nested arrays are not supported");return(function(s,i){const a=[];let c=0;for(const l of s){let f=ir(l,i.childContextForArray(c));f==null&&(f={nullValue:"NULL_VALUE"}),a.push(f),c++}return{arrayValue:{values:a}}})(n,e)}return(function(s,i,a){if((s=$e(s))===null)return{nullValue:"NULL_VALUE"};if(typeof s=="number")return Oa(i.serializer,s);if(typeof s=="boolean")return{booleanValue:s};if(typeof s=="string")return{stringValue:s};if(s instanceof Date){const c=te.fromDate(s);return{timestampValue:Hr(i.serializer,c)}}if(s instanceof te){const c=new te(s.seconds,1e3*Math.floor(s.nanoseconds/1e3));return{timestampValue:Hr(i.serializer,c)}}if(nd(s)){const c=te.fromInstant(s),l=new te(c.seconds,1e3*Math.floor(c.nanoseconds/1e3));return{timestampValue:Hr(i.serializer,l)}}if(s instanceof gt)return{geoPointValue:{latitude:s.latitude,longitude:s.longitude}};if(s instanceof Ke)return s.subtype===0?{bytesValue:ra(i.serializer,s._byteString)}:(function(l,f){const d=f.toUint8Array(),m=new Uint8Array(d.length+1);return m[0]=f.subtype,m.set(d,1),{mapValue:{fields:{[Wi]:{bytesValue:ra(l,ae.fromUint8Array(m))}}}}})(i.serializer,s);if(s instanceof le){const c=i.databaseId,l=s.firestore._databaseId;if(!l.isEqual(c))throw i.createError(`Document reference is for database ${l.projectId}/${l.database} but should be for database ${c.projectId}/${c.database}`);return{referenceValue:Ba(s.firestore._databaseId||i.databaseId,s._key.path)}}if(s instanceof qe)return(function(l,f){const d=l instanceof qe?l.toArray():l;return{mapValue:{fields:{[xa]:{stringValue:Na},[es]:{arrayValue:{values:d.map((I=>{if(typeof I!="number")throw f.createError("VectorValues must only contain numeric values.");return Da(f.serializer,I)}))}}}}}})(s,i);if(s instanceof Ha)return(function(l){return{mapValue:{fields:{[Wt]:{mapValue:{fields:{[Ai]:{stringValue:l.pattern},[bi]:{stringValue:l.options}}}}}}}})(s);if(s instanceof qa)return(function(l){return{mapValue:{fields:{[ts]:{stringValue:l.value}}}}})(s);if(s instanceof Wa)return(function(l){return{mapValue:{fields:{[Nn]:Kn(l.value)}}}})(s);if(s instanceof ja)return(function(l){return{mapValue:{fields:{[en]:{stringValue:l.stringValue}}}}})(s);if(s instanceof $a)return(function(l){return{mapValue:{fields:{[En]:{mapValue:{fields:{[Ri]:Kn(l.seconds),[Pi]:Kn(l.increment)}}}}}}})(s);if(s instanceof At)return(function(){return{mapValue:{fields:{[of]:{nullValue:"NULL_VALUE"}}}}})();if(s instanceof vt)return(function(){return{mapValue:{fields:{[ka]:{nullValue:"NULL_VALUE"}}}}})();if(Gf(s))return s._toProto(i.serializer);throw i.createError(`Unsupported field value: ${zi(s)}`)})(n,e)}function td(n,e){const t={};return Xh(n)?e.path&&e.path.length>0&&e.fieldMask.push(e.path):xn(n,((r,s)=>{const i=ir(s,e.childContextForField(r));i!=null&&(t[r]=i)})),{mapValue:{fields:t}}}function nd(n){if(typeof n!="object"||n===null)return!1;if(typeof Temporal<"u"&&typeof Temporal.Instant=="function"&&n instanceof Temporal.Instant)return!0;const e=n;return e[Symbol.toStringTag]==="Temporal.Instant"&&typeof e.t=="bigint"}function rd(n){return!(typeof n!="object"||n===null||n instanceof Array||n instanceof Date||n instanceof te||n instanceof gt||n instanceof Ke||n instanceof le||n instanceof Ga||n instanceof qe||n instanceof At||n instanceof vt||n instanceof Wa||n instanceof ja||n instanceof Ha||n instanceof qa||n instanceof $a||nd(n)||Gf(n))}function sd(n,e,t){if(!rd(t)||!As(t)){const r=zi(t);throw r==="an object"?e.createError(n+" a custom object"):e.createError(n+" "+r)}}function Cs(n,e,t){if((e=$e(e))instanceof za)return e._internalPath;if(typeof e=="string")return GE(n,e);throw Di("Field path arguments must be of type string or ",n,!1,void 0,t)}const zE=new RegExp("[~\\*/\\[\\]]");function GE(n,e,t){if(e.search(zE)>=0)throw Di(`Invalid field path (${e}). Paths must not contain '~', '*', '/', '[', or ']'`,n,!1,void 0,t);try{return new za(...e.split("."))._internalPath}catch{throw Di(`Invalid field path (${e}). Paths must not be empty, begin with '.', end with '.', or contain '..'`,n,!1,void 0,t)}}function Di(n,e,t,r,s){const i=r&&!r.isEmpty(),a=s!==void 0;let c=`Function ${e}() called with invalid data`;t&&(c+=" (via `toFirestore()`)"),c+=". ";let l="";return(i||a)&&(l+=" (found",i&&(l+=` in field ${r}`),a&&(l+=` in document ${s}`),l+=")"),new D(S.INVALID_ARGUMENT,c+n+l)}function WE(n,e){return n.some((t=>t.isEqual(e)))}function HE(n){return typeof n._readUserData=="function"}/**
 * @license
 * Copyright 2025 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ke{constructor(e){this.optionDefinitions=e}_getKnownOptions(e,t){const r=He.empty();for(const s in this.optionDefinitions)if(this.optionDefinitions.hasOwnProperty(s)){const i=this.optionDefinitions[s];if(s in e){const a=e[s];let c;i.nestedOptions&&As(a)?c={mapValue:{fields:new ke(i.nestedOptions).getOptionsProto(t,a)}}:a&&(c=ir(a,t)??void 0),c&&r.set(Ye.fromServerFormat(i.serverName),c)}}return r}getOptionsProto(e,t,r){const s=this._getKnownOptions(t,e);if(r){const i=new Map(ny(r,((a,c)=>[Ye.fromServerFormat(c),a!==void 0?ir(a,e):null])));s.setAll(i)}return s.value.mapValue.fields??{}}}/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function KE(n){return typeof n=="object"&&n!==null&&!!("nullValue"in n&&(n.nullValue===null||n.nullValue==="NULL_VALUE")||"booleanValue"in n&&(n.booleanValue===null||typeof n.booleanValue=="boolean")||"integerValue"in n&&(n.integerValue===null||typeof n.integerValue=="number"||typeof n.integerValue=="string")||"doubleValue"in n&&(n.doubleValue===null||typeof n.doubleValue=="number")||"timestampValue"in n&&(n.timestampValue===null||(function(t){return typeof t=="object"&&t!==null&&"seconds"in t&&(t.seconds===null||typeof t.seconds=="number"||typeof t.seconds=="string")&&"nanos"in t&&(t.nanos===null||typeof t.nanos=="number")})(n.timestampValue))||"stringValue"in n&&(n.stringValue===null||typeof n.stringValue=="string")||"bytesValue"in n&&(n.bytesValue===null||n.bytesValue instanceof Uint8Array)||"referenceValue"in n&&(n.referenceValue===null||typeof n.referenceValue=="string")||"geoPointValue"in n&&(n.geoPointValue===null||(function(t){return typeof t=="object"&&t!==null&&"latitude"in t&&(t.latitude===null||typeof t.latitude=="number")&&"longitude"in t&&(t.longitude===null||typeof t.longitude=="number")})(n.geoPointValue))||"arrayValue"in n&&(n.arrayValue===null||(function(t){return typeof t=="object"&&t!==null&&!(!("values"in t)||t.values!==null&&!Array.isArray(t.values))})(n.arrayValue))||"mapValue"in n&&(n.mapValue===null||(function(t){return typeof t=="object"&&t!==null&&!(!("fields"in t)||t.fields!==null&&!As(t.fields))})(n.mapValue))||"fieldReferenceValue"in n&&(n.fieldReferenceValue===null||typeof n.fieldReferenceValue=="string")||"functionValue"in n&&(n.functionValue===null||(function(t){return typeof t=="object"&&t!==null&&!(!("name"in t)||t.name!==null&&typeof t.name!="string"||!("args"in t)||t.args!==null&&!Array.isArray(t.args))})(n.functionValue))||"pipelineValue"in n&&(n.pipelineValue===null||(function(t){return typeof t=="object"&&t!==null&&!(!("stages"in t)||t.stages!==null&&!Array.isArray(t.stages))})(n.pipelineValue)))}function tI(){return new Ya("serverTimestamp")}function QE(n){return new qe(n)}/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function N(n){let e;return n instanceof On?n:(e=As(n)?tw(n):n instanceof Array?nw(n):id(n,void 0),e)}function Bo(n){if(n instanceof On)return n;if(n instanceof qe)return fs(n);if(Array.isArray(n))return fs(QE(n));throw new Error("Unsupported value: "+typeof n)}function Ja(n){return cy(n)?XE(n):N(n)}class On{constructor(){this._protoValueType="ProtoValue"}add(e){return new P("add",[this,N(e)],"add")}asBoolean(){if(this instanceof rn)return this;if(this instanceof pr)return new ad(this);if(this instanceof xs)return new ew(this);if(this instanceof P)return new od(this);throw new D("invalid-argument",`Conversion of type ${typeof this} to BooleanExpression not supported.`)}subtract(e){return new P("subtract",[this,N(e)],"subtract")}multiply(e){return new P("multiply",[this,N(e)],"multiply")}divide(e){return new P("divide",[this,N(e)],"divide")}mod(e){return new P("mod",[this,N(e)],"mod")}equal(e){return new P("equal",[this,N(e)],"equal").asBoolean()}notEqual(e){return new P("not_equal",[this,N(e)],"notEqual").asBoolean()}lessThan(e){return new P("less_than",[this,N(e)],"lessThan").asBoolean()}lessThanOrEqual(e){return new P("less_than_or_equal",[this,N(e)],"lessThanOrEqual").asBoolean()}greaterThan(e){return new P("greater_than",[this,N(e)],"greaterThan").asBoolean()}greaterThanOrEqual(e){return new P("greater_than_or_equal",[this,N(e)],"greaterThanOrEqual").asBoolean()}arrayConcat(e,...t){const r=[e,...t].map((s=>N(s)));return new P("array_concat",[this,...r],"arrayConcat")}arrayContains(e){return new P("array_contains",[this,N(e)],"arrayContains").asBoolean()}arrayContainsAll(e){const t=Array.isArray(e)?new Fr(e.map(N),"arrayContainsAll"):e;return new P("array_contains_all",[this,t],"arrayContainsAll").asBoolean()}arrayContainsAny(e){const t=Array.isArray(e)?new Fr(e.map(N),"arrayContainsAny"):e;return new P("array_contains_any",[this,t],"arrayContainsAny").asBoolean()}arrayReverse(){return new P("array_reverse",[this])}arrayLength(){return new P("array_length",[this],"arrayLength")}equalAny(e){const t=Array.isArray(e)?new Fr(e.map(N),"equalAny"):e;return new P("equal_any",[this,t],"equalAny").asBoolean()}notEqualAny(e){const t=Array.isArray(e)?new Fr(e.map(N),"notEqualAny"):e;return new P("not_equal_any",[this,t],"notEqualAny").asBoolean()}exists(){return new P("exists",[this],"exists").asBoolean()}charLength(){return new P("char_length",[this],"charLength")}like(e){return new P("like",[this,N(e)],"like").asBoolean()}regexContains(e){return new P("regex_contains",[this,N(e)],"regexContains").asBoolean()}regexFind(e){return new P("regex_find",[this,N(e)],"regexFind")}regexFindAll(e){return new P("regex_find_all",[this,N(e)],"regexFindAll")}regexMatch(e){return new P("regex_match",[this,N(e)],"regexMatch").asBoolean()}stringContains(e){return new P("string_contains",[this,N(e)],"stringContains").asBoolean()}startsWith(e){return new P("starts_with",[this,N(e)],"startsWith").asBoolean()}endsWith(e){return new P("ends_with",[this,N(e)],"endsWith").asBoolean()}toLower(){return new P("to_lower",[this],"toLower")}toUpper(){return new P("to_upper",[this],"toUpper")}trim(e){const t=[this];return e&&t.push(N(e)),new P("trim",t,"trim")}ltrim(e){const t=[this];return e&&t.push(N(e)),new P("ltrim",t,"ltrim")}rtrim(e){const t=[this];return e&&t.push(N(e)),new P("rtrim",t,"rtrim")}type(){return new P("type",[this])}isType(e){return new P("is_type",[this,fs(e)],"isType").asBoolean()}stringConcat(e,...t){const r=[e,...t].map(N);return new P("string_concat",[this,...r],"stringConcat")}stringIndexOf(e){return new P("string_index_of",[this,N(e)],"stringIndexOf")}stringRepeat(e){return new P("string_repeat",[this,N(e)],"stringRepeat")}stringReplaceAll(e,t){return new P("string_replace_all",[this,N(e),N(t)],"stringReplaceAll")}stringReplaceOne(e,t){return new P("string_replace_one",[this,N(e),N(t)],"stringReplaceOne")}concat(e,...t){const r=[e,...t].map(N);return new P("concat",[this,...r],"concat")}reverse(){return new P("reverse",[this],"reverse")}arrayFilter(e,t){return new P("array_filter",[this,N(e),t],"arrayFilter")}arrayTransform(e,t){return new P("array_transform",[this,N(e),t],"arrayTransform")}arrayTransformWithIndex(e,t,r){return new P("array_transform",[this,N(e),N(t),r],"arrayTransformWithIndex")}arraySlice(e,t){const r=[this,N(e)];return t!==void 0&&r.push(N(t)),new P("array_slice",r,"arraySlice")}arrayFirst(){return new P("array_first",[this],"arrayFirst")}arrayFirstN(e){return new P("array_first_n",[this,N(e)],"arrayFirstN")}arrayLast(){return new P("array_last",[this],"arrayLast")}arrayLastN(e){return new P("array_last_n",[this,N(e)],"arrayLastN")}arrayMaximum(){return new P("maximum",[this],"arrayMaximum")}arrayMaximumN(e){return new P("maximum_n",[this,N(e)],"arrayMaximumN")}arrayMinimum(){return new P("minimum",[this],"arrayMinimum")}arrayMinimumN(e){return new P("minimum_n",[this,N(e)],"arrayMinimumN")}arrayIndexOf(e){return new P("array_index_of",[this,N(e),N("first")],"arrayIndexOf")}arrayLastIndexOf(e){return new P("array_index_of",[this,N(e),N("last")],"arrayLastIndexOf")}arrayIndexOfAll(e){return new P("array_index_of_all",[this,N(e)],"arrayIndexOfAll")}byteLength(){return new P("byte_length",[this],"byteLength")}ceil(){return new P("ceil",[this])}floor(){return new P("floor",[this])}abs(){return new P("abs",[this])}exp(){return new P("exp",[this])}mapGet(e){return new P("map_get",[this,fs(e)],"mapGet")}mapSet(e,t,...r){const s=[this,N(e),N(t),...r.map(N)];return new P("map_set",s,"mapSet")}mapKeys(){return new P("map_keys",[this],"mapKeys")}mapValues(){return new P("map_values",[this],"mapValues")}mapEntries(){return new P("map_entries",[this],"mapEntries")}getField(e){return new P("get_field",[this,N(e)],"get_field")}count(){return We._create("count",[this],"count")}sum(){return We._create("sum",[this],"sum")}average(){return We._create("average",[this],"average")}minimum(){return We._create("minimum",[this],"minimum")}maximum(){return We._create("maximum",[this],"maximum")}first(){return We._create("first",[this],"first")}last(){return We._create("last",[this],"last")}arrayAgg(){return We._create("array_agg",[this],"arrayAgg")}arrayAggDistinct(){return We._create("array_agg_distinct",[this],"arrayAggDistinct")}countDistinct(){return We._create("count_distinct",[this],"countDistinct")}logicalMaximum(e,...t){const r=[e,...t];return new P("maximum",[this,...r.map(N)],"logicalMaximum")}logicalMinimum(e,...t){const r=[e,...t];return new P("minimum",[this,...r.map(N)],"minimum")}vectorLength(){return new P("vector_length",[this],"vectorLength")}cosineDistance(e){return new P("cosine_distance",[this,Bo(e)],"cosineDistance")}dotProduct(e){return new P("dot_product",[this,Bo(e)],"dotProduct")}euclideanDistance(e){return new P("euclidean_distance",[this,Bo(e)],"euclideanDistance")}unixMicrosToTimestamp(){return new P("unix_micros_to_timestamp",[this],"unixMicrosToTimestamp")}timestampToUnixMicros(){return new P("timestamp_to_unix_micros",[this],"timestampToUnixMicros")}unixMillisToTimestamp(){return new P("unix_millis_to_timestamp",[this],"unixMillisToTimestamp")}timestampToUnixMillis(){return new P("timestamp_to_unix_millis",[this],"timestampToUnixMillis")}unixSecondsToTimestamp(){return new P("unix_seconds_to_timestamp",[this],"unixSecondsToTimestamp")}timestampToUnixSeconds(){return new P("timestamp_to_unix_seconds",[this],"timestampToUnixSeconds")}timestampAdd(e,t){return new P("timestamp_add",[this,N(e),N(t)],"timestampAdd")}timestampSubtract(e,t){return new P("timestamp_subtract",[this,N(e),N(t)],"timestampSubtract")}timestampDiff(e,t){return new P("timestamp_diff",[this,Ja(e),N(t)],"timestampDiff")}timestampExtract(e,t){const r=[this,N(e)];return t&&r.push(N(t)),new P("timestamp_extract",r,"timestampExtract")}documentId(){return new P("document_id",[this],"documentId")}parent(){return new P("parent",[this],"parent")}substring(e,t){const r=N(e);return new P("substring",t===void 0?[this,r]:[this,r,N(t)],"substring")}arrayGet(e){return new P("array_get",[this,N(e)],"arrayGet")}isError(){return new P("is_error",[this],"isError").asBoolean()}ifError(e){const t=new P("if_error",[this,N(e)],"ifError");return e instanceof rn?t.asBoolean():t}isAbsent(){return new P("is_absent",[this],"isAbsent").asBoolean()}mapRemove(e){return new P("map_remove",[this,N(e)],"mapRemove")}mapMerge(e,...t){const r=N(e),s=t.map(N);return new P("map_merge",[this,r,...s],"mapMerge")}pow(e){return new P("pow",[this,N(e)])}trunc(e){return e===void 0?new P("trunc",[this]):new P("trunc",[this,N(e)],"trunc")}round(e){return e===void 0?new P("round",[this]):new P("round",[this,N(e)],"round")}collectionId(){return new P("collection_id",[this])}length(){return new P("length",[this])}ln(){return new P("ln",[this])}sqrt(){return new P("sqrt",[this])}stringReverse(){return new P("string_reverse",[this])}ifAbsent(e){return new P("if_absent",[this,N(e)],"ifAbsent")}ifNull(e){return new P("if_null",[this,N(e)],"ifNull")}coalesce(e,...t){return new P("coalesce",[this,N(e),...t.map(N)],"coalesce")}join(e){return new P("join",[this,N(e)],"join")}log10(){return new P("log10",[this])}arraySum(){return new P("sum",[this])}split(e){return new P("split",[this,N(e)])}timestampTruncate(e,t){const r=[this,N(e)];return t&&r.push(N(t)),new P("timestamp_trunc",r)}ascending(){return rw(this)}descending(){return sw(this)}as(e){return new JE(this,e,"as")}}class We{constructor(e,t){this.name=e,this.params=t,this.exprType="AggregateFunction",this._protoValueType="ProtoValue"}static _create(e,t,r){const s=new We(e,t);return s._methodName=r,s}as(e){return new YE(this,e,"as")}_toProto(e){return{functionValue:{name:this.name,args:this.params.map((t=>t._toProto(e)))}}}_readUserData(e){e=this._methodName?e.contextWith({methodName:this._methodName}):e,this.params.forEach((t=>t._readUserData(e)))}}class YE{constructor(e,t,r){this.aggregate=e,this.alias=t,this._methodName=r}_readUserData(e){this.aggregate._readUserData(e)}}class JE{constructor(e,t,r){this.expr=e,this.alias=t,this._methodName=r,this.exprType="AliasedExpression",this.selectable=!0}_readUserData(e){this.expr._readUserData(e)}}class Fr extends On{constructor(e,t){super(),this.di=e,this._methodName=t,this.expressionType="ListOfExpressions"}_toProto(e){return{arrayValue:{values:this.di.map((t=>t._toProto(e)))}}}_readUserData(e){this.di.forEach((t=>t._readUserData(e)))}}class xs extends On{constructor(e,t){super(),this.fieldPath=e,this._methodName=t,this.expressionType="Field",this.selectable=!0}get _fieldPath(){return this.fieldPath}get fieldName(){return this.fieldPath.canonicalString()}get alias(){return this.fieldName}get expr(){return this}geoDistance(e){return new P("geo_distance",[this,N(e)],"geoDistance")}_toProto(e){return{fieldReferenceValue:this.fieldPath.canonicalString()}}_readUserData(e){}}function XE(n){return ZE(n,"field")}function ZE(n,e){return new xs(typeof n=="string"?er===n?hE()._internalPath:Cs("field",n):n._internalPath,e)}class pr extends On{constructor(e,t){super(),this.value=e,this._methodName=t,this.expressionType="Constant"}static _fromProto(e){const t=new pr(e,void 0);return t._protoValue=e,t}_toProto(e){return U(this._protoValue!==void 0,237),this._protoValue}_getValue(){return this._protoValue}_readUserData(e){e=this._methodName?e.contextWith({methodName:this._methodName}):e,KE(this._protoValue)||(this._protoValue=ir(this.value,e))}}function fs(n,e){return id(n,"constant")}function id(n,e){const t=new pr(n,e);return typeof n=="boolean"?new ad(t):t}class P extends On{constructor(e,t,r,s){super(),this.name=e,this.params=t,this.expressionType="Function",this._optionsProto=void 0,r!==void 0&&(this._methodName=r),s!==void 0&&(this._options=s)}get _optionsUtil(){return new ke({})}_toProto(e){const t={functionValue:{name:this.name,args:this.params.map((r=>r._toProto(e)))}};return this._optionsProto&&(t.functionValue.options=this._optionsProto),t}_readUserData(e){e=this._methodName?e.contextWith({methodName:this._methodName}):e,this.params.forEach((t=>t._readUserData(e))),this._options&&(this._optionsProto=this._optionsUtil.getOptionsProto(e,this._options))}}class rn extends On{get _methodName(){return this._expr._methodName}countIf(){return We._create("count_if",[this],"countIf")}not(){return new P("not",[this],"not").asBoolean()}conditional(e,t){return new P("conditional",[this,e,t],"conditional")}ifError(e){const t=N(e),r=new P("if_error",[this,t],"ifError");return t instanceof rn?r.asBoolean():r}_toProto(e){return this._expr._toProto(e)}_readUserData(e){this._expr._readUserData(e)}}class od extends rn{constructor(e){super(),this._expr=e,this.expressionType="Function"}}class ad extends rn{constructor(e){super(),this._expr=e,this.expressionType="Constant"}_getValue(){return this._expr._getValue()}}class ew extends rn{constructor(e){super(),this._expr=e,this.expressionType="Field"}}function tw(n,e){const t=[];for(const r in n)if(Object.prototype.hasOwnProperty.call(n,r)){const s=n[r];t.push(fs(r)),t.push(N(s))}return new P("map",t,"map")}function nw(n){return(function(t,r){return new P("array",t.map((s=>N(s))),r)})(n,"array")}function rw(n){return new cd(Ja(n),"ascending","ascending")}function sw(n){return new cd(Ja(n),"descending","descending")}class cd{constructor(e,t,r){this.expr=e,this.direction=t,this._methodName=r,this._protoValueType="ProtoValue"}_toProto(e){return{mapValue:{fields:{direction:Wf(this.direction),expression:this.expr._toProto(e)}}}}_readUserData(e){this.expr._readUserData(e)}}class Je{constructor(e){this.optionsProto=void 0,{rawOptions:this.rawOptions,...this.knownOptions}=e}_readUserData(e){this.optionsProto=this._optionsUtil.getOptionsProto(e,this.knownOptions,this.rawOptions)}_toProto(e){return{name:this._name,options:this.optionsProto}}}class ud extends Je{get _name(){return"add_fields"}get _optionsUtil(){return new ke({})}constructor(e,t){super(t),this.fields=e}_toProto(e){return{...super._toProto(e),args:[hs(e,this.fields)]}}_readUserData(e){super._readUserData(e),sn(this.fields,e)}}class ld extends Je{get _name(){return"aggregate"}get _optionsUtil(){return new ke({})}constructor(e,t,r){super(r),this.groups=e,this.accumulators=t}_toProto(e){return{...super._toProto(e),args:[hs(e,this.accumulators),hs(e,this.groups)]}}_readUserData(e){super._readUserData(e),sn(this.groups,e),sn(this.accumulators,e)}}class hd extends Je{get _name(){return"distinct"}get _optionsUtil(){return new ke({})}constructor(e,t){super(t),this.groups=e}_toProto(e){return{...super._toProto(e),args:[hs(e,this.groups)]}}_readUserData(e){super._readUserData(e),sn(this.groups,e)}}class eo extends Je{get _name(){return"collection"}get _optionsUtil(){return new ke({forceIndex:{serverName:"force_index"}})}constructor(e,t){super(t),this.pi=ow(e)}_toProto(e){return{...super._toProto(e),args:[{referenceValue:this.pi}]}}_readUserData(e){super._readUserData(e)}}class to extends Je{get _name(){return"collection_group"}get _optionsUtil(){return new ke({forceIndex:{serverName:"force_index"}})}constructor(e,t){super(t),this.collectionId=e}_toProto(e){return{...super._toProto(e),args:[{referenceValue:""},{stringValue:this.collectionId}]}}_readUserData(e){super._readUserData(e)}}class Xa extends Je{get _name(){return"database"}get _optionsUtil(){return new ke({})}_toProto(e){return{...super._toProto(e)}}_readUserData(e){super._readUserData(e)}}class Za extends Je{get _name(){return"documents"}get _optionsUtil(){return new ke({})}constructor(e,t){if(super(t),!e||e.length===0)throw new D(S.INVALID_ARGUMENT,"Empty document paths are not allowed in DocumentsSource");const r=e.map((i=>i.startsWith("/")?i:"/"+i)),s=new Set(r);if(s.size!==r.length)throw new D(S.INVALID_ARGUMENT,"Duplicate document paths are not allowed in DocumentsSource");this.gi=r,this.yi=s}_toProto(e){return{...super._toProto(e),args:this.gi.map((t=>({referenceValue:t})))}}_readUserData(e){super._readUserData(e)}}class ec extends Je{get _name(){return"where"}get _optionsUtil(){return new ke({})}constructor(e,t){super(t),this.condition=e}_toProto(e){return{...super._toProto(e),args:[this.condition._toProto(e)]}}_readUserData(e){super._readUserData(e),sn(this.condition,e)}}class ds extends Je{get _name(){return"limit"}get _optionsUtil(){return new ke({})}constructor(e,t){U(!isNaN(e)&&e!==1/0&&e!==-1/0,34860),super(t),this.limit=e}_toProto(e){return{...super._toProto(e),args:[Oa(e,this.limit)]}}}class Ul extends Je{get _name(){return"offset"}get _optionsUtil(){return new ke({})}constructor(e,t){super(t),this.offset=e}_toProto(e){return{...super._toProto(e),args:[Oa(e,this.offset)]}}}class iw extends Je{get _name(){return"select"}get _optionsUtil(){return new ke({})}constructor(e,t){super(t),this.selections=e}_toProto(e){return{...super._toProto(e),args:[hs(e,this.selections)]}}_readUserData(e){super._readUserData(e),sn(this.selections,e)}}class tc extends Je{get _name(){return"sort"}get _optionsUtil(){return new ke({})}constructor(e,t){super(t),this.orderings=e}_toProto(e){return{...super._toProto(e),args:this.orderings.map((t=>t._toProto(e)))}}_readUserData(e){super._readUserData(e),sn(this.orderings,e)}}class nc extends Je{get _name(){return"replace_with"}get _optionsUtil(){return new ke({})}constructor(e,t){super(t),this.map=e}_toProto(e){return{...super._toProto(e),args:[this.map._toProto(e),Wf(nc.bi)]}}_readUserData(e){super._readUserData(e),sn(this.map,e)}}nc.bi="full_replace";function ow(n){const e=typeof n=="string"?n:n.path;return e.startsWith("/")?e:"/"+e}function sn(n,e){return HE(n)?n._readUserData(e):Array.isArray(n)?n.forEach((t=>t._readUserData(e))):n instanceof Map?n.forEach((t=>t._readUserData(e))):Object.values(n).forEach((t=>t._readUserData(e))),n}// Copyright 2024 Google LLC* @license
class Fe{constructor(e,t,r){this.serializer=e,this.stages=t,this.listenOptions=r,this.isCorePipeline=!0}getPipelineCollection(){return no(this)}getPipelineCollectionGroup(){return rc(this)}getPipelineCollectionId(){return aw(this)}getPipelineDocuments(){return aa(this)}getPipelineFlavor(){return(function(t){let r="exact";return t.stages.forEach(((s,i)=>{s._name!==hd.name&&s._name!==ld.name||(r="keyless"),s._name===iw.name&&r==="exact"&&(r="augmented"),s._name===ud.name&&i<t.stages.length-1&&r==="exact"&&(r="augmented")})),r})(this)}getPipelineSourceType(){return Jt(this)}}function Jt(n){const e=n.stages[0];return e instanceof eo||e instanceof to||e instanceof Xa||e instanceof Za?e._name:"unknown"}function no(n){if(Jt(n)==="collection")return n.stages[0].pi}function rc(n){if(Jt(n)==="collection_group")return n.stages[0].collectionId}function aw(n){switch(Jt(n)){case"collection":return ee.fromString(no(n)).lastSegment();case"collection_group":return rc(n);default:return}}function aa(n){if(Jt(n)==="documents")return n.stages[0].gi}class E{constructor(e,t){this.type=e,this.value=t}static Oi(){return new E("ERROR",void 0)}static Mi(){return new E("UNSET",void 0)}static Ni(){return new E("NULL",nr)}static newValue(e){return Qe(e)?new E("NULL",nr):(function(r){return!!r&&"booleanValue"in r})(e)?new E("BOOLEAN",e):lt(e)?new E("INT",e):ht(e)?new E("DOUBLE",e):(function(r){return!!r&&"timestampValue"in r&&!!r.timestampValue})(e)?new E("TIMESTAMP",e):(function(r){return!!r&&"stringValue"in r})(e)?new E("STRING",e):(function(r){return!!r&&"bytesValue"in r})(e)?new E("BYTES",e):e.referenceValue?new E("REFERENCE",e):e.geoPointValue?new E("GEO_POINT",e):sr(e)?new E("ARRAY",e):Xo(e)?new E("VECTOR",e):In(e)?new E("MAP",e):new E("ERROR",void 0)}Bi(){return this.type==="ERROR"||this.type==="UNSET"}Li(){return this.type==="NULL"}}function Kr(n){if(!n.Bi())return n.value}function fd(n){return n instanceof rn?n._expr:n}function j(n){if((n=fd(n))instanceof xs)return new cw(n);if(n instanceof pr)return new uw(n);if(n instanceof Fr)return new lw(n);if(n instanceof P){if(n.name==="add")return new dw(n);if(n.name==="subtract")return new pw(n);if(n.name==="multiply")return new mw(n);if(n.name==="divide")return new gw(n);if(n.name==="mod")return new _w(n);if(n.name==="and")return new yw(n);if(n.name==="equal")return new Cw(n);if(n.name==="not_equal")return new xw(n);if(n.name==="less_than")return new Nw(n);if(n.name==="less_than_or_equal")return new kw(n);if(n.name==="greater_than")return new Dw(n);if(n.name==="greater_than_or_equal")return new Ow(n);if(n.name==="array_concat")return new Lw(n);if(n.name==="array_reverse")return new Mw(n);if(n.name==="array_contains")return new Uw(n);if(n.name==="array_contains_all")return new Fw(n);if(n.name==="array_contains_any")return new Bw(n);if(n.name==="array_length")return new qw(n);if(n.name==="array_element")return new $w(n);if(n.name==="equal_any")return new dd(n);if(n.name==="not_equal_any")return new ww(n);if(n.name==="is_nan")return new Tw(n);if(n.name==="is_not_nan")return new Iw(n);if(n.name==="is_null")return new vw(n);if(n.name==="is_not_null")return new Aw(n);if(n.name==="is_error")return new bw(n);if(n.name==="exists")return new Rw(n);if(n.name==="not")return new ro(n);if(n.name==="or")return new Ew(n);if(n.name==="xor")return new sc(n);if(n.name==="conditional")return new Pw(n);if(n.name==="maximum")return new Vw(n);if(n.name==="minimum")return new Sw(n);if(n.name==="reverse")return new jw(n);if(n.name==="replace_first")return new zw(n);if(n.name==="replace_all")return new Gw(n);if(n.name==="char_length")return new Ww(n);if(n.name==="byte_length")return new Hw(n);if(n.name==="like")return new Kw(n);if(n.name==="regex_contains")return new Qw(n);if(n.name==="regex_match")return new Yw(n);if(n.name==="string_contains")return new Jw(n);if(n.name==="starts_with")return new Xw(n);if(n.name==="ends_with")return new Zw(n);if(n.name==="to_lower")return new eT(n);if(n.name==="to_upper")return new tT(n);if(n.name==="trim")return new nT(n);if(n.name==="string_concat")return new rT(n);if(n.name==="map_get")return new sT(n);if(n.name==="cosine_distance")return new iT(n);if(n.name==="dot_product")return new oT(n);if(n.name==="euclidean_distance")return new aT(n);if(n.name==="vector_length")return new cT(n);if(n.name==="unix_micros_to_timestamp")return new dT(n);if(n.name==="timestamp_to_unix_micros")return new gT(n);if(n.name==="unix_millis_to_timestamp")return new pT(n);if(n.name==="timestamp_to_unix_millis")return new _T(n);if(n.name==="unix_seconds_to_timestamp")return new mT(n);if(n.name==="timestamp_to_unix_seconds")return new yT(n);if(n.name==="timestamp_add")return new ET(n);if(n.name==="timestamp_subtract")return new wT(n)}throw new Error(`Unknown Expr : ${n}`)}class cw{constructor(e){this.expr=e}evaluate(e,t){if(this.expr.fieldName===er)return E.newValue({referenceValue:ki(e.serializer,t.key)});if(this.expr.fieldName==="__update_time__")return E.newValue({timestampValue:di(e.serializer,t.version)});if(this.expr.fieldName==="__create_time__")return E.newValue({timestampValue:di(e.serializer,t.createTime)});const r=t.data.field(this.expr._fieldPath);return r?Sa(r)?E.newValue((function(i,a){if(i.serverTimestampBehavior==="estimate")return{timestampValue:di(i.serializer,G.fromTimestamp(tr(a)))};if(i.serverTimestampBehavior==="previous"){const c=Rs(a);if(c)return c}return{nullValue:"NULL_VALUE"}})(e,r)):E.newValue(r):E.Mi()}}class uw{constructor(e){this.expr=e}evaluate(e,t){return E.newValue(this.expr._getValue())}}class lw{constructor(e){this.expr=e}evaluate(e,t){const r=this.expr.di.map((s=>j(s).evaluate(e,t)));return r.some((s=>s.Bi()))?E.Oi():E.newValue({arrayValue:{values:r.map((s=>s.value))}})}}function Pe(n){return ht(n)?Number(n.doubleValue):Number(n.integerValue)}function yt(n){return BigInt(n.integerValue)}const hw=BigInt("0x7fffffffffffffff"),fw=-BigInt("0x8000000000000000");class Ns{constructor(e){this.expr=e}evaluate(e,t){U(this.expr.params.length>=2,24778);const r=j(this.expr.params[0]).evaluate(e,t),s=j(this.expr.params[1]).evaluate(e,t);let i=this.$i(r,s);for(const a of this.expr.params.slice(2)){const c=j(a).evaluate(e,t);i=this.$i(i,c)}return i}$i(e,t){if(e.Bi()||t.Bi())return E.Oi();if(e.Li()||t.Li())return E.Ni();const r=e.value,s=t.value;if(!ht(r)&&!lt(r)||!ht(s)&&!lt(s))return E.Oi();if(ht(r)||ht(s)){const i=this.Ui(r,s);return i?E.newValue(i):E.Oi()}if(lt(r)&&lt(s)){const i=this.ki(r,s);return i===void 0?E.Oi():typeof i=="number"?E.newValue({doubleValue:i}):i<fw||i>hw?E.Oi():E.newValue({integerValue:`${i}`})}return E.Oi()}}function Nt(n,e){return me(n)!==me(e)?"TYPE_MISMATCH":Ae(n)||Ae(e)?"NOT_EQ":Qe(n)&&Qe(e)?"EQ":Qe(n)||Qe(e)?"NULL":sr(n)&&sr(e)?(function(r,s){var a,c,l;if(((a=r.values)==null?void 0:a.length)!==((c=s.values)==null?void 0:c.length))return"NOT_EQ";let i=!1;for(let f=0;f<(((l=r.values)==null?void 0:l.length)??0);f++){const d=r.values[f],m=s.values[f];switch(Nt(d,m)){case"EQ":break;case"NOT_EQ":case"TYPE_MISMATCH":return"NOT_EQ";case"NULL":i=!0;break;default:q(44609,{Qi:d,qi:m})}}return i?"NULL":"EQ"})(n.arrayValue,e.arrayValue):Xo(n)&&Xo(e)||In(n)&&In(e)?(function(r,s){const i=r.fields||{},a=s.fields||{};if(Sn(i)!==Sn(a))return"NOT_EQ";let c=!1;for(const l in i)if(i.hasOwnProperty(l)){if(a[l]===void 0)return"NOT_EQ";switch(Nt(i[l],a[l])){case"NOT_EQ":case"TYPE_MISMATCH":return"NOT_EQ";case"NULL":c=!0}}return c?"NULL":"EQ"})(n.mapValue,e.mapValue):(function(r,s){return Ze(r,s,{be:!1,ye:!0,we:!0})})(n,e)?"EQ":"NOT_EQ"}class dw extends Ns{ki(e,t){return yt(e)+yt(t)}Ui(e,t){return{doubleValue:Pe(e)+Pe(t)}}}class pw extends Ns{constructor(e){super(e),this.expr=e}ki(e,t){return yt(e)-yt(t)}Ui(e,t){return{doubleValue:Pe(e)-Pe(t)}}}class mw extends Ns{constructor(e){super(e),this.expr=e}ki(e,t){return yt(e)*yt(t)}Ui(e,t){return{doubleValue:Pe(e)*Pe(t)}}}class gw extends Ns{constructor(e){super(e),this.expr=e}ki(e,t){const r=yt(t);if(r!==BigInt(0))return yt(e)/r}Ui(e,t){const r=Pe(t);return r===0?{doubleValue:Zr(r)?Number.NEGATIVE_INFINITY:Number.POSITIVE_INFINITY}:{doubleValue:Pe(e)/r}}}class _w extends Ns{constructor(e){super(e),this.expr=e}ki(e,t){const r=yt(t);if(r!==BigInt(0))return yt(e)%r}Ui(e,t){const r=Pe(t);if(r!==0)return{doubleValue:Pe(e)%r}}}class yw{constructor(e){this.expr=e}evaluate(e,t){var i;let r=!1,s=!1;for(const a of this.expr.params){const c=j(a).evaluate(e,t);switch(c.type){case"BOOLEAN":if(!((i=c.value)!=null&&i.booleanValue))return E.newValue(ve);break;case"NULL":s=!0;break;default:r=!0}}return r?E.Oi():s?E.Ni():E.newValue(je)}}class ro{constructor(e){this.expr=e}evaluate(e,t){var s;U(this.expr.params.length===1,9634);const r=j(this.expr.params[0]).evaluate(e,t);switch(r.type){case"BOOLEAN":return E.newValue({booleanValue:!((s=r.value)!=null&&s.booleanValue)});case"NULL":return E.Ni();default:return E.Oi()}}}class Ew{constructor(e){this.expr=e}evaluate(e,t){var i;let r=!1,s=!1;for(const a of this.expr.params){const c=j(a).evaluate(e,t);switch(c.type){case"BOOLEAN":if((i=c.value)!=null&&i.booleanValue)return E.newValue(je);break;case"NULL":s=!0;break;default:r=!0}}return r?E.Oi():s?E.Ni():E.newValue(ve)}}class sc{constructor(e){this.expr=e}evaluate(e,t){var i;let r=!1,s=!1;for(const a of this.expr.params){const c=j(a).evaluate(e,t);switch(c.type){case"BOOLEAN":r=sc.xor(r,!!((i=c.value)!=null&&i.booleanValue));break;case"NULL":s=!0;break;default:return E.Oi()}}return s?E.Ni():E.newValue({booleanValue:r})}static xor(e,t){return(e||t)&&!(e&&t)}}class dd{constructor(e){this.expr=e}evaluate(e,t){var a,c;U(this.expr.params.length===2,55094);let r=!1;const s=j(this.expr.params[0]).evaluate(e,t);switch(s.type){case"NULL":r=!0;break;case"ERROR":case"UNSET":return E.Oi()}const i=j(this.expr.params[1]).evaluate(e,t);switch(i.type){case"ARRAY":break;case"NULL":r=!0;break;default:return E.Oi()}if(r)return E.Ni();for(const l of((c=(a=i.value)==null?void 0:a.arrayValue)==null?void 0:c.values)??[])switch(Qe(s.value)&&Qe(l)?"EQ":Nt(s.value,l)){case"EQ":return E.newValue(je);case"NOT_EQ":case"TYPE_MISMATCH":break;case"NULL":r=!0;break;default:q(44608,{value:s.value,candidate:l})}return r?E.Ni():E.newValue(ve)}}class ww{constructor(e){this.expr=e}evaluate(e,t){return new ro(new P("not",[new P("equal_any",this.expr.params)])).evaluate(e,t)}}class Tw{constructor(e){this.expr=e}evaluate(e,t){U(this.expr.params.length===1,23322);const r=j(this.expr.params[0]).evaluate(e,t);switch(r.type){case"INT":return E.newValue(ve);case"DOUBLE":return E.newValue({booleanValue:isNaN(Pe(r.value))});case"NULL":return E.Ni();default:return E.Oi()}}}class Iw{constructor(e){this.expr=e}evaluate(e,t){return U(this.expr.params.length===1,50406),new ro(new P("not",[new P("is_nan",this.expr.params)])).evaluate(e,t)}}class vw{constructor(e){this.expr=e}evaluate(e,t){switch(U(this.expr.params.length===1,23123),j(this.expr.params[0]).evaluate(e,t).type){case"NULL":return E.newValue(je);case"UNSET":case"ERROR":return E.Oi();default:return E.newValue(ve)}}}class Aw{constructor(e){this.expr=e}evaluate(e,t){return U(this.expr.params.length===1,23167),new ro(new P("not",[new P("is_null",this.expr.params)])).evaluate(e,t)}}class bw{constructor(e){this.expr=e}evaluate(e,t){return U(this.expr.params.length===1,5228),j(this.expr.params[0]).evaluate(e,t).type==="ERROR"?E.newValue(je):E.newValue(ve)}}class Rw{constructor(e){this.expr=e}evaluate(e,t){switch(U(this.expr.params.length===1,6877),j(this.expr.params[0]).evaluate(e,t).type){case"ERROR":return E.Oi();case"UNSET":return E.newValue(ve);default:return E.newValue(je)}}}class Pw{constructor(e){this.expr=e}evaluate(e,t){var s;U(this.expr.params.length===3,11706);const r=j(this.expr.params[0]).evaluate(e,t);switch(r.type){case"BOOLEAN":return(s=r.value)!=null&&s.booleanValue?j(this.expr.params[1]).evaluate(e,t):j(this.expr.params[2]).evaluate(e,t);case"NULL":return j(this.expr.params[2]).evaluate(e,t);default:return E.Oi()}}}class Vw{constructor(e){this.expr=e}evaluate(e,t){const r=this.expr.params.map((i=>j(i).evaluate(e,t)));let s;for(const i of r)switch(i.type){case"ERROR":case"UNSET":case"NULL":continue;default:s=s===void 0||ze(i.value,s.value)>0?i:s}return s===void 0?E.Ni():s}}class Sw{constructor(e){this.expr=e}evaluate(e,t){const r=this.expr.params.map((i=>j(i).evaluate(e,t)));let s;for(const i of r)switch(i.type){case"ERROR":case"UNSET":case"NULL":continue;default:s=s===void 0||ze(i.value,s.value)<0?i:s}return s===void 0?E.Ni():s}}class mr{constructor(e){this.expr=e}evaluate(e,t){U(this.expr.params.length===2,31033,`${this.expr.name}() function should have exactly 2 params`);const r=j(this.expr.params[0]).evaluate(e,t);switch(r.type){case"ERROR":case"UNSET":return E.Oi()}const s=j(this.expr.params[1]).evaluate(e,t);switch(s.type){case"ERROR":case"UNSET":return E.Oi()}return this.Ki(r,s)}}class Cw extends mr{constructor(e){super(e),this.expr=e}Ki(e,t){if(e.Li()&&t.Li())return E.newValue(je);if(e.Li()||t.Li()||Ae(e.value)||Ae(t.value)||me(e.value)!==me(t.value))return E.newValue(ve);switch(Nt(e.value,t.value)){case"EQ":return E.newValue(je);case"NOT_EQ":return E.newValue(ve);case"NULL":return E.Ni();default:q(44615,{left:e,right:t})}}}class xw extends mr{constructor(e){super(e),this.expr=e}Ki(e,t){switch(Nt(e.value,t.value)){case"EQ":return E.newValue(ve);case"NOT_EQ":case"TYPE_MISMATCH":return E.newValue(je);case"NULL":return E.Ni();default:q(44614,{left:e,right:t})}}}class Nw extends mr{constructor(e){super(e),this.expr=e}Ki(e,t){return me(e.value)!==me(t.value)||Ae(e.value)||Ae(t.value)?E.newValue(ve):E.newValue({booleanValue:ze(e.value,t.value)<0})}}class kw extends mr{constructor(e){super(e),this.expr=e}Ki(e,t){return me(e.value)!==me(t.value)||Ae(e.value)||Ae(t.value)?E.newValue(ve):Nt(e.value,t.value)==="EQ"?E.newValue(je):E.newValue({booleanValue:ze(e.value,t.value)<0})}}class Dw extends mr{constructor(e){super(e),this.expr=e}Ki(e,t){return me(e.value)!==me(t.value)||Ae(e.value)||Ae(t.value)?E.newValue(ve):E.newValue({booleanValue:ze(e.value,t.value)>0})}}class Ow extends mr{constructor(e){super(e),this.expr=e}Ki(e,t){return me(e.value)!==me(t.value)||Ae(e.value)||Ae(t.value)?E.newValue(ve):Nt(e.value,t.value)==="EQ"?E.newValue(je):E.newValue({booleanValue:ze(e.value,t.value)>0})}}class Lw{constructor(e){this.expr=e}evaluate(e,t){throw new Error("Unimplemented")}}class Mw{constructor(e){this.expr=e}evaluate(e,t){var s;U(this.expr.params.length===1,216);const r=j(this.expr.params[0]).evaluate(e,t);switch(r.type){case"NULL":return E.Ni();case"ARRAY":{const i=((s=r.value.arrayValue)==null?void 0:s.values)??[];return E.newValue({arrayValue:{values:[...i].reverse()}})}default:return E.Oi()}}}class Uw{constructor(e){this.expr=e}evaluate(e,t){return U(this.expr.params.length===2,52884),new dd(new P("eq_any",[this.expr.params[1],this.expr.params[0]])).evaluate(e,t)}}class Fw{constructor(e){this.expr=e}evaluate(e,t){var l,f,d,m;U(this.expr.params.length===2,1392);let r=!1;const s=j(this.expr.params[0]).evaluate(e,t);switch(s.type){case"ARRAY":break;case"NULL":r=!0;break;default:return E.Oi()}const i=j(this.expr.params[1]).evaluate(e,t);switch(i.type){case"ARRAY":break;case"NULL":r=!0;break;default:return E.Oi()}if(r)return E.Ni();const a=((f=(l=i.value)==null?void 0:l.arrayValue)==null?void 0:f.values)??[],c=((m=(d=s.value)==null?void 0:d.arrayValue)==null?void 0:m.values)??[];for(const I of a){let V=!1;r=!1;for(const x of c){switch(Qe(I)&&Qe(x)?"EQ":Nt(I,x)){case"EQ":V=!0;break;case"NOT_EQ":case"TYPE_MISMATCH":break;case"NULL":r=!0;break;default:q(44613,{value:x,search:I})}if(V)break}if(!V)return E.newValue(ve)}return E.newValue(je)}}class Bw{constructor(e){this.expr=e}evaluate(e,t){var l,f,d,m;U(this.expr.params.length===2,2680);let r=!1;const s=j(this.expr.params[0]).evaluate(e,t);switch(s.type){case"ARRAY":break;case"NULL":r=!0;break;default:return E.Oi()}const i=j(this.expr.params[1]).evaluate(e,t);switch(i.type){case"ARRAY":break;case"NULL":r=!0;break;default:return E.Oi()}if(r)return E.Ni();const a=((f=(l=i.value)==null?void 0:l.arrayValue)==null?void 0:f.values)??[],c=((m=(d=s.value)==null?void 0:d.arrayValue)==null?void 0:m.values)??[];for(const I of c)for(const V of a)switch(Qe(I)&&Qe(V)?"EQ":Nt(I,V)){case"EQ":return E.newValue(je);case"NOT_EQ":case"TYPE_MISMATCH":break;case"NULL":r=!0;break;default:q(60403,{value:I,search:V})}return r?E.Ni():E.newValue(ve)}}class qw{constructor(e){this.expr=e}evaluate(e,t){var s,i,a;U(this.expr.params.length===1,38605);const r=j(this.expr.params[0]).evaluate(e,t);switch(r.type){case"NULL":return E.Ni();case"ARRAY":return E.newValue({integerValue:`${((a=(i=(s=r.value)==null?void 0:s.arrayValue)==null?void 0:i.values)==null?void 0:a.length)??0}`});default:return E.Oi()}}}class $w{constructor(e){this.expr=e}evaluate(e,t){throw new Error("Unimplemented")}}class jw{constructor(e){this.expr=e}evaluate(e,t){var s,i;U(this.expr.params.length===1,1508);const r=j(this.expr.params[0]).evaluate(e,t);switch(r.type){case"NULL":return E.Ni();case"BYTES":{const a=(s=r.value)==null?void 0:s.bytesValue;if(typeof a=="string"){const c=ae.fromBase64String(a).toUint8Array();return c.reverse(),E.newValue({bytesValue:ae.fromUint8Array(c).toBase64()})}return E.newValue({bytesValue:new Uint8Array(a).reverse()})}case"STRING":{const a=(i=r.value)==null?void 0:i.stringValue,c=new Intl.__PRIVATE_Segmenter(void 0,{granularity:"grapheme"}).segment(a),l=Array.from(c,(f=>f.segment)).reverse();return E.newValue({stringValue:l.join("")})}default:return E.Oi()}}}class zw{constructor(e){this.expr=e}evaluate(e,t){throw new Error("Unimplemented")}}class Gw{constructor(e){this.expr=e}evaluate(e,t){throw new Error("Unimplemented")}}class Ww{constructor(e){this.expr=e}evaluate(e,t){U(this.expr.params.length===1,19400);const r=j(this.expr.params[0]).evaluate(e,t);switch(r.type){case"NULL":return E.Ni();case"STRING":{const s=(function(a){let c=0;for(let l=0;l<a.length;l++){const f=a.codePointAt(l);if(f===void 0)return;if(f<=65535)if(f>=55296&&f<=57343)if(f<=56319){const d=a.codePointAt(l+1);d!==void 0&&d>=56320&&d<=57343?(c+=1,l++):c+=1}else c+=1;else c+=1;else{if(!(f<=1114111))return;c+=1,l++}}return c})(r.value.stringValue);return s===void 0?E.Oi():E.newValue({integerValue:s})}default:return E.Oi()}}}class Hw{constructor(e){this.expr=e}evaluate(e,t){var s,i;U(this.expr.params.length===1,8486);const r=j(this.expr.params[0]).evaluate(e,t);switch(r.type){case"BYTES":{const a=(s=r.value)==null?void 0:s.bytesValue;return typeof a=="string"?E.newValue({integerValue:ae.fromBase64String(a).toUint8Array().length}):E.newValue({integerValue:new Uint8Array(a).length})}case"STRING":{const a=(function(l){let f=0;for(let d=0;d<l.length;d++){const m=l.codePointAt(d);if(m===void 0)return;if(m>=55296&&m<=57343){if(!(m<=56319))return;{const I=l.codePointAt(d+1);if(I===void 0||!(I>=56320&&I<=57343))return;f+=4,d++}}else if(m<=127)f+=1;else if(m<=2047)f+=2;else if(m<=65535)f+=3;else{if(!(m<=1114111))return;f+=4,d++}}return f})((i=r.value)==null?void 0:i.stringValue);return a===void 0?E.Oi():E.newValue({integerValue:a})}case"NULL":return E.Ni();default:return E.Oi()}}}class gr{constructor(e){this.expr=e}evaluate(e,t){var a,c;U(this.expr.params.length===2,39773,`${this.expr.name}() function should have exactly two parameters`);let r=!1;const s=j(this.expr.params[0]).evaluate(e,t);switch(s.type){case"STRING":break;case"NULL":r=!0;break;default:return E.Oi()}const i=j(this.expr.params[1]).evaluate(e,t);switch(i.type){case"STRING":break;case"NULL":r=!0;break;default:return E.Oi()}return r?E.Ni():this.Wi((a=s.value)==null?void 0:a.stringValue,(c=i.value)==null?void 0:c.stringValue)}}class Kw extends gr{Wi(e,t){try{const r=(function(a){let c="";for(let l=0;l<a.length;l++){const f=a.charAt(l);switch(f){case"_":c+=".";break;case"%":c+=".*";break;case"\\":case".":case"*":case"?":case"+":case"^":case"$":case"|":case"(":case")":case"[":case"]":case"{":case"}":c+="\\"+f;break;default:c+=f}}return"^"+c+"$"})(t),s=ma.compile(r);return E.newValue({booleanValue:s.matches(e)})}catch(r){return it(`Invalid LIKE pattern converted to regex: ${t}, returning error. Error: ${r}`),E.Oi()}}}class Qw extends gr{Wi(e,t){try{const r=ma.compile(t);return E.newValue({booleanValue:r.test(e)})}catch{return it(`Invalid regex pattern found in regex_contains: ${t}, returning error`),E.Oi()}}}class Yw extends gr{Wi(e,t){try{return E.newValue({booleanValue:ma.compile(t).matches(e)})}catch{return it(`Invalid regex pattern found in regex_match: ${t}, returning error`),E.Oi()}}}class Jw extends gr{Wi(e,t){return E.newValue({booleanValue:e.includes(t)})}}class Xw extends gr{Wi(e,t){return E.newValue({booleanValue:e.startsWith(t)})}}class Zw extends gr{Wi(e,t){return E.newValue({booleanValue:e.endsWith(t)})}}class eT{constructor(e){this.expr=e}evaluate(e,t){var s,i;U(this.expr.params.length===1,29079);const r=j(this.expr.params[0]).evaluate(e,t);switch(r.type){case"STRING":return E.newValue({stringValue:(i=(s=r.value)==null?void 0:s.stringValue)==null?void 0:i.toLowerCase()});case"NULL":return E.Ni();default:return E.Oi()}}}class tT{constructor(e){this.expr=e}evaluate(e,t){var s,i;U(this.expr.params.length===1,60487);const r=j(this.expr.params[0]).evaluate(e,t);switch(r.type){case"STRING":return E.newValue({stringValue:(i=(s=r.value)==null?void 0:s.stringValue)==null?void 0:i.toUpperCase()});case"NULL":return E.Ni();default:return E.Oi()}}}class nT{constructor(e){this.expr=e}evaluate(e,t){var s,i;U(this.expr.params.length===1,28544);const r=j(this.expr.params[0]).evaluate(e,t);switch(r.type){case"STRING":return E.newValue({stringValue:(i=(s=r.value)==null?void 0:s.stringValue)==null?void 0:i.trim()});case"NULL":return E.Ni();default:return E.Oi()}}}class rT{constructor(e){this.expr=e}evaluate(e,t){const r=this.expr.params.map((a=>j(a).evaluate(e,t)));let s="",i=!1;for(const a of r)switch(a.type){case"STRING":s+=a.value.stringValue;break;case"NULL":i=!0;break;default:return E.Oi()}return i?E.Ni():E.newValue({stringValue:s})}}class sT{constructor(e){this.expr=e}evaluate(e,t){var a,c,l,f;U(this.expr.params.length===2,4483);const r=j(this.expr.params[0]).evaluate(e,t);switch(r.type){case"UNSET":return E.Mi();case"MAP":break;default:return E.Oi()}const s=j(this.expr.params[1]).evaluate(e,t);if(s.type!=="STRING")return E.Oi();const i=(f=(c=(a=r.value)==null?void 0:a.mapValue)==null?void 0:c.fields)==null?void 0:f[(l=s.value)==null?void 0:l.stringValue];return i===void 0?E.Mi():E.newValue(i)}}class ic{constructor(e){this.expr=e}evaluate(e,t){var f,d;U(this.expr.params.length===2,25231,`${this.expr.name}() function should have exactly 2 params`);let r=!1;const s=j(this.expr.params[0]).evaluate(e,t);switch(s.type){case"VECTOR":break;case"NULL":r=!0;break;default:return E.Oi()}const i=j(this.expr.params[1]).evaluate(e,t);switch(i.type){case"VECTOR":break;case"NULL":r=!0;break;default:return E.Oi()}if(r)return E.Ni();const a=Zo(s.value),c=Zo(i.value);if(a===void 0||c===void 0||((f=a.values)==null?void 0:f.length)!==((d=c.values)==null?void 0:d.length))return E.Oi();const l=this.Gi(a,c);return l===void 0||isNaN(l)?E.Oi():E.newValue({doubleValue:l})}}class iT extends ic{Gi(e,t){const r=(e==null?void 0:e.values)??[],s=(t==null?void 0:t.values)??[];if(r.length===0)return;let i=0,a=0,c=0;for(let f=0;f<r.length;f++){if(!xt(r[f])||!xt(s[f]))return;const d=Pe(r[f]),m=Pe(s[f]);i+=d*m,a+=d*d,c+=m*m}const l=Math.sqrt(a)*Math.sqrt(c);if(l!==0)return 1-Math.max(-1,Math.min(1,i/l))}}class oT extends ic{Gi(e,t){const r=(e==null?void 0:e.values)??[],s=(t==null?void 0:t.values)??[];if(r.length===0)return 0;let i=0;for(let a=0;a<r.length;a++){if(!xt(r[a])||!xt(s[a]))return;i+=Pe(r[a])*Pe(s[a])}return i}}class aT extends ic{Gi(e,t){const r=(e==null?void 0:e.values)??[],s=(t==null?void 0:t.values)??[];if(r.length===0)return 0;let i=0;for(let a=0;a<r.length;a++){if(!xt(r[a])||!xt(s[a]))return;const c=Pe(r[a]),l=Pe(s[a]);i+=Math.pow(c-l,2)}return Math.sqrt(i)}}class cT{constructor(e){this.expr=e}evaluate(e,t){var s;U(this.expr.params.length===1,39044);const r=j(this.expr.params[0]).evaluate(e,t);switch(r.type){case"VECTOR":{const i=Zo(r.value);return E.newValue({integerValue:((s=i==null?void 0:i.values)==null?void 0:s.length)??0})}case"NULL":return E.Ni();default:return E.Oi()}}}const ps=BigInt(-62135596800),ms=BigInt(253402300799),Oi=BigInt(1e3),Xt=BigInt(1e6),uT=ps*Oi,lT=ms*Oi+BigInt(999),hT=ps*Xt,fT=ms*Xt+BigInt(999999);function oc(n){return n>=hT&&n<=fT}function pd(n){return n>=ps&&n<=ms}function gs(n,e){const t=BigInt(n);return!(t<ps||t>ms)&&!(e<0||e>=1e9)&&(t!==ps||e===0)&&!(t===ms&&e>999999999)}function md(n,e){return e<0?{seconds:n-1,nanos:e+1e9}:{seconds:n,nanos:e}}function ac(n){return BigInt(n.seconds)*Xt+BigInt(Math.trunc(n.nanoseconds/1e3))}class cc{constructor(e){this.expr=e}evaluate(e,t){U(this.expr.params.length===1,49262,`${this.expr.name}() function should have exactly one parameter`);const r=j(this.expr.params[0]).evaluate(e,t);switch(r.type){case"INT":return this.toTimestamp(BigInt(r.value.integerValue));case"NULL":return E.Ni();default:return E.Oi()}}}class dT extends cc{toTimestamp(e){if(!oc(e))return E.Oi();let t=Number(e/Xt),r=Number(e%Xt*BigInt(1e3));const s=md(t,r);return t=s.seconds,r=s.nanos,gs(t,r)?E.newValue({timestampValue:{seconds:t,nanos:r}}):E.Oi()}}class pT extends cc{toTimestamp(e){if(!(function(a){return a>=uT&&a<=lT})(e))return E.Oi();let t=Number(e/Oi),r=Number(e%Oi*BigInt(1e6));const s=md(t,r);return t=s.seconds,r=s.nanos,gs(t,r)?E.newValue({timestampValue:{seconds:t,nanos:r}}):E.Oi()}}class mT extends cc{toTimestamp(e){if(!pd(e))return E.Oi();const t=Number(e);return E.newValue({timestampValue:{seconds:t,nanos:0}})}}class uc{constructor(e){this.expr=e}evaluate(e,t){U(this.expr.params.length===1,1265,`${this.expr.name}() function should have exactly one parameter`);const r=j(this.expr.params[0]).evaluate(e,t);switch(r.type){case"TIMESTAMP":break;case"NULL":return E.Ni();default:return E.Oi()}const s=Fa(r.value.timestampValue);return gs(s.seconds,s.nanoseconds)?this.ji(s):E.Oi()}}class gT extends uc{ji(e){const t=ac(e);return oc(t)?E.newValue({integerValue:`${t.toString()}`}):E.Oi()}}class _T extends uc{ji(e){const t=ac(e),r=t/BigInt(1e3),s=t%BigInt(1e3);return r>BigInt(0)||s===BigInt(0)?E.newValue({integerValue:r.toString()}):E.newValue({integerValue:(r-BigInt(1)).toString()})}}class yT extends uc{ji(e){const t=BigInt(e.seconds);return pd(t)?E.newValue({integerValue:t.toString()}):E.Oi()}}class gd{constructor(e){this.expr=e}evaluate(e,t){U(this.expr.params.length===3,2775,`${this.expr.name}() function should have exactly 3 parameters`);let r=!1;const s=j(this.expr.params[0]).evaluate(e,t);switch(s.type){case"TIMESTAMP":break;case"NULL":r=!0;break;default:return E.Oi()}const i=j(this.expr.params[1]).evaluate(e,t);let a;switch(i.type){case"STRING":if(a=(function(J){switch(J){case"microsecond":return"microsecond";case"millisecond":return"millisecond";case"second":return"second";case"minute":return"minute";case"hour":return"hour";case"day":return"day";default:return}})(i.value.stringValue),a===void 0)return E.Oi();break;case"NULL":r=!0;break;default:return E.Oi()}const c=j(this.expr.params[2]).evaluate(e,t);switch(c.type){case"INT":break;case"NULL":r=!0;break;default:return E.Oi()}if(r)return E.Ni();const l=BigInt(c.value.integerValue);let f;try{switch(a){case"microsecond":f=l;break;case"millisecond":f=l*BigInt(1e3);break;case"second":f=l*BigInt(1e6);break;case"minute":f=l*BigInt(6e7);break;case"hour":f=l*BigInt(36e8);break;case"day":f=l*BigInt(864e8);break;default:return E.Oi()}if(a!=="microsecond"&&l!==BigInt(0)&&f/l!==BigInt(this.zi(a)))return E.Oi()}catch(W){return it(`Error during timestamp arithmetic: ${W}`),E.Oi()}const d=Fa(s.value.timestampValue);if(!gs(d.seconds,d.nanoseconds))return E.Oi();const m=ac(d),I=this.Hi(m,f);if(!oc(I))return E.Oi();const V=Number(I/Xt),x=I%Xt,M=Number((x<0?x+Xt:x)*BigInt(1e3)),O=x<0?V-1:V;return gs(O,M)?E.newValue({timestampValue:{seconds:O,nanos:M}}):E.Oi()}zi(e){switch(e){case"millisecond":return 1e3;case"second":return 1e6;case"minute":return 6e7;case"hour":return 36e8;case"day":return 864e8;default:return 1}}}class ET extends gd{Hi(e,t){return e+t}}class wT extends gd{Hi(e,t){return e-t}}function _s(n){if((n=fd(n))instanceof xs)return`fld(${n.fieldName})`;if(n instanceof pr)return`cst(${(function(t){return t===null?"null":typeof t=="number"?t.toString():typeof t=="string"?`"${t}"`:t instanceof le?`ref(${t.path})`:t instanceof qe?`vec(${JSON.stringify(t)})`:JSON.stringify(t)})(n.value)})`;if(n instanceof P)return`fn(${n.name},[${n.params.map(_s).join(",")}])`;if(n.expressionType==="ListOfExpressions")return`list([${n.di.map(_s).join(",")}])`;throw new Error(`Unrecognized expr ${JSON.stringify(n,null,2)}`)}function TT(n){if(n instanceof ud)return`${n._name}(${ni(n.fields)})`;if(n instanceof ld){let e=`${n._name}(${ni(n.accumulators)})`;return n.groups.size>0&&(e+=`grouping(${ni(n.groups)})`),e}if(n instanceof hd)return`${n._name}(${ni(n.groups)})`;if(n instanceof eo)return`${n._name}(${n.pi})`;if(n instanceof to)return`${n._name}(${n.collectionId})`;if(n instanceof Xa)return`${n._name}()`;if(n instanceof Za)return`${n._name}(${n.gi.sort()})`;if(n instanceof ec)return`${n._name}(${_s(n.condition)})`;if(n instanceof ds)return`${n._name}(${n.limit})`;if(n instanceof tc)return`${n._name}(${(function(t){return t.map((r=>`${_s(r.expr)}${r.direction}`)).join(",")})(n.orderings)})`;throw new Error(`Unrecognized stage ${n._name}`)}function ni(n){return`${Array.from(n.entries()).sort().map((([e,t])=>`${e}=${_s(t)}`)).join(",")}`}function Pt(n){return n.stages.map((e=>TT(e))).join("|")}function _d(n,e){return Pt(n)===Pt(e)}function Ee(n){return n instanceof Fe}function Fl(n){return Ee(n)?Pt(n):Gr(n)}function yd(n){return Ee(n)?Pt(n):(function(t){return`${Sf(pt(t))}|lt:${t.limitType}`})(n)}function so(n,e){return n instanceof Fe&&e instanceof Fe?_d(n,e):!(n instanceof Fe&&!(e instanceof Fe)||!(n instanceof Fe)&&e instanceof Fe)&&Ly(n,e)}function Ed(n){return _n(n)?Pt(n):Sf(n)}function wd(n,e){return n instanceof Fe&&e instanceof Fe?_d(n,e):!(n instanceof Fe&&!(e instanceof Fe)||!(n instanceof Fe)&&e instanceof Fe)&&Cf(n,e)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class IT{constructor(e,t,r,s){this.batchId=e,this.localWriteTime=t,this.baseMutations=r,this.mutations=s}applyToRemoteDocument(e,t){const r=t.mutationResults;for(let s=0;s<this.mutations.length;s++){const i=this.mutations[s];i.key.isEqual(e.key)&&gy(i,e,r[s])}}applyToLocalView(e,t){for(const r of this.baseMutations)r.key.isEqual(e.key)&&(t=jr(r,e,t,this.localWriteTime));for(const r of this.mutations)r.key.isEqual(e.key)&&(t=jr(r,e,t,this.localWriteTime));return t}applyToLocalDocumentSet(e,t){const r=Lf();return this.mutations.forEach((s=>{const i=e.get(s.key),a=i.overlayedDocument;let c=this.applyToLocalView(a,i.mutatedFields);c=t.has(s.key)?null:c;const l=wf(a,c);l!==null&&r.set(s.key,l),a.isValidDocument()||a.convertToNoDocument(G.min())})),r}keys(){return this.mutations.reduce(((e,t)=>e.add(t.key)),Y())}isEqual(e){return this.batchId===e.batchId&&Zn(this.mutations,e.mutations,((t,r)=>gl(t,r)))&&Zn(this.baseMutations,e.baseMutations,((t,r)=>gl(t,r)))}}class lc{constructor(e,t,r,s){this.batch=e,this.commitVersion=t,this.mutationResults=r,this.docVersions=s}static from(e,t,r){U(e.mutations.length===r.length,58842,{Ji:e.mutations.length,Yi:r.length});let s=(function(){return qy})();const i=e.mutations;for(let a=0;a<i.length;a++)s=s.insert(i[a].key,r[a].version);return new lc(e,t,r,s)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Td="";function vT(n){let e="";for(let t=0;t<n.length;t++)e.length>0&&(e=Bl(e)),e=AT(n.get(t),e);return Bl(e)}function AT(n,e){let t=e;const r=n.length;for(let s=0;s<r;s++){const i=n.charAt(s);switch(i){case"\0":t+="";break;case Td:t+="";break;default:t+=i}}return t}function Bl(n){return n+Td+""}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class bT{constructor(e,t){this.largestBatchId=e,this.mutation=t}getKey(){return this.mutation.key}isEqual(e){return e!==null&&this.mutation===e.mutation}toString(){return`Overlay{
      largestBatchId: ${this.largestBatchId},
      mutation: ${this.mutation.toString()}
    }`}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class bt{constructor(e,t,r,s,i=G.min(),a=G.min(),c=ae.EMPTY_BYTE_STRING,l=null){this.target=e,this.targetId=t,this.purpose=r,this.sequenceNumber=s,this.snapshotVersion=i,this.lastLimboFreeSnapshotVersion=a,this.resumeToken=c,this.expectedCount=l}withSequenceNumber(e){return new bt(this.target,this.targetId,this.purpose,e,this.snapshotVersion,this.lastLimboFreeSnapshotVersion,this.resumeToken,this.expectedCount)}withResumeToken(e,t){return new bt(this.target,this.targetId,this.purpose,this.sequenceNumber,t,this.lastLimboFreeSnapshotVersion,e,null)}withExpectedCount(e){return new bt(this.target,this.targetId,this.purpose,this.sequenceNumber,this.snapshotVersion,this.lastLimboFreeSnapshotVersion,this.resumeToken,e)}withLastLimboFreeSnapshotVersion(e){return new bt(this.target,this.targetId,this.purpose,this.sequenceNumber,this.snapshotVersion,e,this.resumeToken,this.expectedCount)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class RT{constructor(e){this.Xi=e}}function PT(n){const e=sE({parent:n.parent,structuredQuery:n.structuredQuery});return n.limitType==="LAST"?Ni(e,e.limit,"L"):e}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class VT{constructor(){this.d_=new ST}addToCollectionParentIndex(e,t){return this.d_.add(t),C.resolve()}getCollectionParents(e,t){return C.resolve(this.d_.getEntries(t))}addFieldIndex(e,t){return C.resolve()}deleteFieldIndex(e,t){return C.resolve()}deleteAllFieldIndexes(e){return C.resolve()}createTargetIndexes(e,t){return C.resolve()}getDocumentsMatchingTarget(e,t){return C.resolve(null)}getIndexType(e,t){return C.resolve(0)}getFieldIndexes(e,t){return C.resolve([])}getNextCollectionGroupToUpdate(e){return C.resolve(null)}getMinOffset(e,t){return C.resolve(nn.min())}getMinOffsetFromCollectionGroup(e,t){return C.resolve(nn.min())}updateCollectionGroup(e,t,r){return C.resolve()}updateIndexEntries(e,t){return C.resolve()}}class ST{constructor(){this.index={}}add(e){const t=e.lastSegment(),r=e.popLast(),s=this.index[t]||new pe(ee.comparator),i=!s.has(r);return this.index[t]=s.add(r),i}has(e){const t=e.lastSegment(),r=e.popLast(),s=this.index[t];return s&&s.has(r)}getEntries(e){return(this.index[e]||new pe(ee.comparator)).toArray()}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class on{constructor(e){this.K_=e}next(){return this.K_+=2,this.K_}static W_(){return new on(0)}static G_(){return new on(-1)}}// Copyright 2024 Google LLC* @license
function Id(n,e){var r;let t=e;for(const s of n.stages)t=xT({serializer:n.serializer,serverTimestampBehavior:(r=n.listenOptions)==null?void 0:r.serverTimestampBehavior},s,t);return t}function io(n,e){return Id(n,[e]).length>0}function CT(n,e){return Ee(n)?io(n,e):Yi(n,e)}function xT(n,e,t){if(e instanceof eo)return(function(s,i,a){return a.filter((c=>c.isFoundDocument()&&`/${c.key.getCollectionPath().canonicalString()}`===i.pi))})(0,e,t);if(e instanceof ec)return(function(s,i,a){return a.filter((c=>{const l=Kr(j(i.condition).evaluate(s,c));return l!==void 0&&Ze(l,je)}))})(n,e,t);if(e instanceof to)return(function(s,i,a){return a.filter((c=>c.isFoundDocument()&&c.key.getCollectionPath().lastSegment()===i.collectionId))})(0,e,t);if(e instanceof Xa)return(function(s,i,a){return a.filter((c=>c.isFoundDocument()))})(0,0,t);if(e instanceof Za)return(function(s,i,a){return a.filter((c=>c.isFoundDocument()&&i.yi.has(c.key.path.toStringWithLeadingSlash())))})(0,e,t);if(e instanceof ds)return(function(s,i,a){return a.slice(0,i.limit)})(0,e,t);if(e instanceof tc)return(function(s,i,a){const c=i.orderings.map((l=>({eo:j(l.expr),direction:l.direction})));return[...a].sort(((l,f)=>{for(const{eo:d,direction:m}of c){const I=Kr(d.evaluate(s,l)),V=Kr(d.evaluate(s,f)),x=ze(I??nr,V??nr);if(x!==0)return m==="ascending"?x:-x}return 0}))})(n,e,t);throw new Error(`Unknown stage: ${e._name}`)}function ca(n){const e=(function(r){for(let s=r.stages.length-1;s>=0;s--){const i=r.stages[s];if(i instanceof tc)return i.orderings}throw new Error("Pipeline must contain at least one Sort stage")})(n);return(t,r)=>{for(const s of e){const i=Kr(j(s.expr).evaluate({serializer:n.serializer},t)),a=Kr(j(s.expr).evaluate({serializer:n.serializer},r)),c=ze(i||nr,a||nr);if(c!==0)return s.direction==="ascending"?c:-c}return 0}}function qo(n){for(let e=n.stages.length-1;e>=0;e--){const t=n.stages[e];if(t instanceof ds)return{limit:t.limit}}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class NT{constructor(){this.changes=new Dn((e=>e.toString()),((e,t)=>e.isEqual(t))),this.changesApplied=!1}addEntry(e){this.assertNotApplied(),this.changes.set(e.key,e)}removeEntry(e,t){this.assertNotApplied(),this.changes.set(e,xe.newInvalidDocument(e).setReadTime(t))}getEntry(e,t){this.assertNotApplied();const r=this.changes.get(t);return r!==void 0?C.resolve(r):this.getFromCache(e,t)}getEntries(e,t){return this.getAllFromCache(e,t)}apply(e){return this.assertNotApplied(),this.changesApplied=!0,this.applyChanges(e)}assertNotApplied(){}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *//**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class kT{constructor(e,t){this.overlayedDocument=e,this.mutatedFields=t}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class DT{constructor(e,t,r,s){this.remoteDocumentCache=e,this.mutationQueue=t,this.documentOverlayCache=r,this.indexManager=s}getDocument(e,t){let r=null;return this.documentOverlayCache.getOverlay(e,t).next((s=>(r=s,this.remoteDocumentCache.getEntry(e,t)))).next((s=>(r!==null&&jr(r.mutation,s,rt.empty(),te.now()),s)))}getDocuments(e,t){return this.remoteDocumentCache.getEntries(e,t).next((r=>this.getLocalViewOfDocuments(e,r,Y()).next((()=>r))))}getLocalViewOfDocuments(e,t,r=Y()){const s=Gt();return this.populateOverlays(e,s,t).next((()=>this.computeViews(e,t,s,r).next((i=>{let a=$n();return i.forEach(((c,l)=>{a=a.insert(c,l.overlayedDocument)})),a}))))}getOverlayedDocuments(e,t){const r=Gt();return this.populateOverlays(e,r,t).next((()=>this.computeViews(e,t,r,Y())))}populateOverlays(e,t,r){const s=[];return r.forEach((i=>{t.has(i)||s.push(i)})),this.documentOverlayCache.getOverlays(e,s).next((i=>{i.forEach(((a,c)=>{t.set(a,c)}))}))}computeViews(e,t,r,s){let i=Be();const a=Wr(),c=(function(){return Wr()})();return t.forEach(((l,f)=>{const d=r.get(f.key);s.has(f.key)&&(d===void 0||d.mutation instanceof kn)?i=i.insert(f.key,f):d!==void 0?(a.set(f.key,d.mutation.getFieldMask()),jr(d.mutation,f,d.mutation.getFieldMask(),te.now())):a.set(f.key,rt.empty())})),this.recalculateAndSaveOverlays(e,i).next((l=>(l.forEach(((f,d)=>a.set(f,d))),t.forEach(((f,d)=>c.set(f,new kT(d,a.get(f)??null)))),c)))}recalculateAndSaveOverlays(e,t){const r=Wr();let s=new oe(((a,c)=>a-c)),i=Y();return this.mutationQueue.getAllMutationBatchesAffectingDocumentKeys(e,t).next((a=>{for(const c of a)c.keys().forEach((l=>{const f=t.get(l);if(f===null)return;let d=r.get(l)||rt.empty();d=c.applyToLocalView(f,d),r.set(l,d);const m=(s.get(c.batchId)||Y()).add(l);s=s.insert(c.batchId,m)}))})).next((()=>{const a=[],c=s.getReverseIterator();for(;c.hasNext();){const l=c.getNext(),f=l.key,d=l.value,m=Lf();d.forEach((I=>{if(!i.has(I)){const V=wf(t.get(I),r.get(I));V!==null&&m.set(I,V),i=i.add(I)}})),a.push(this.documentOverlayCache.saveOverlays(e,f,m))}return C.waitFor(a)})).next((()=>r))}recalculateAndSaveOverlaysForDocumentKeys(e,t){return this.remoteDocumentCache.getEntries(e,t).next((r=>this.recalculateAndSaveOverlays(e,r)))}getDocumentsMatchingQuery(e,t,r,s){return Ee(t)?this.getDocumentsMatchingPipeline(e,t,r,s):ky(t)?this.getDocumentsMatchingDocumentQuery(e,t.path):Nf(t)?this.getDocumentsMatchingCollectionGroupQuery(e,t,r,s):this.getDocumentsMatchingCollectionQuery(e,t,r,s)}getNextDocuments(e,t,r,s){return this.remoteDocumentCache.getAllFromCollectionGroup(e,t,r,s).next((i=>{const a=s-i.size>0?this.documentOverlayCache.getOverlaysForCollectionGroup(e,t,r.largestBatchId,s-i.size):C.resolve(Gt());let c=ls,l=i;return a.next((f=>C.forEach(f,((d,m)=>(c<m.largestBatchId&&(c=m.largestBatchId),i.get(d)?C.resolve():this.remoteDocumentCache.getEntry(e,d).next((I=>{l=l.insert(d,I)}))))).next((()=>this.populateOverlays(e,f,i))).next((()=>this.computeViews(e,l,f,Y()))).next((d=>({batchId:c,changes:Of(d)})))))}))}getDocumentsMatchingDocumentQuery(e,t){return this.getDocument(e,new F(t)).next((r=>{let s=$n();return r.isFoundDocument()&&(s=s.insert(r.key,r)),s}))}getDocumentsMatchingCollectionGroupQuery(e,t,r,s){const i=t.collectionGroup;let a=$n();return this.indexManager.getCollectionParents(e,i).next((c=>C.forEach(c,(l=>{const f=(function(m,I){return new hr(I,null,m.explicitOrderBy.slice(),m.filters.slice(),m.limit,m.limitType,m.startAt,m.endAt)})(t,l.child(i));return this.getDocumentsMatchingCollectionQuery(e,f,r,s).next((d=>{d.forEach(((m,I)=>{a=a.insert(m,I)}))}))})).next((()=>a))))}getDocumentsMatchingCollectionQuery(e,t,r,s){let i;return this.documentOverlayCache.getOverlaysForCollection(e,t.path,r.largestBatchId).next((a=>(i=a,this.remoteDocumentCache.getDocumentsMatchingQuery(e,t,r,i,s)))).next((a=>this.retrieveMatchingLocalDocuments(i,a,(c=>Yi(t,c)))))}getDocumentsMatchingPipeline(e,t,r,s){if(Jt(t)==="collection_group"){const i=rc(t);let a=$n();return this.indexManager.getCollectionParents(e,i).next((c=>C.forEach(c,(l=>{const f=(function(m,I){const V=m.stages.map((x=>x instanceof to?new eo(I.canonicalString(),{}):x));return new Fe(m.serializer,V)})(t,l.child(i));return this.getDocumentsMatchingPipeline(e,f,r,s).next((d=>{d.forEach(((m,I)=>{a=a.insert(m,I)}))}))})).next((()=>a))))}{let i;return this.getOverlaysForPipeline(e,t,r.largestBatchId).next((a=>{switch(i=a,Jt(t)){case"collection":return this.remoteDocumentCache.getDocumentsMatchingQuery(e,t,r,i,s);case"documents":let c=Y();for(const l of aa(t))c=c.add(F.fromPath(l));return this.remoteDocumentCache.getEntries(e,c);case"database":return this.remoteDocumentCache.getAllEntries(e);default:throw new D("invalid-argument",`Invalid pipeline source to execute offline: ${Pt(t)}`)}})).next((a=>this.retrieveMatchingLocalDocuments(i,a,(c=>io(t,c)))))}}retrieveMatchingLocalDocuments(e,t,r){e.forEach(((i,a)=>{const c=a.getKey();t.get(c)===null&&(t=t.insert(c,xe.newInvalidDocument(c)))}));let s=$n();return t.forEach(((i,a)=>{const c=e.get(i);c!==void 0&&jr(c.mutation,a,rt.empty(),te.now()),r(a)&&(s=s.insert(i,a))})),s}getOverlaysForPipeline(e,t,r){switch(Jt(t)){case"collection":return this.documentOverlayCache.getOverlaysForCollection(e,ee.fromString(no(t)),r);case"collection_group":throw new D("invalid-argument",`Unexpected collection group pipeline: ${Pt(t)}`);case"documents":return this.documentOverlayCache.getOverlays(e,aa(t).map((s=>F.fromPath(s))));case"database":return this.documentOverlayCache.getAllOverlays(e,r);default:throw new D("invalid-argument",`Failed to get overlays for pipeline: ${Pt(t)}`)}}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class OT{constructor(e){this.serializer=e,this.co=new Map,this.lo=new Map}getBundleMetadata(e,t){return C.resolve(this.co.get(t))}saveBundleMetadata(e,t){return this.co.set(t.id,(function(s){return{id:s.id,version:s.version,createTime:mt(s.createTime)}})(t)),C.resolve()}getNamedQuery(e,t){return C.resolve(this.lo.get(t))}saveNamedQuery(e,t){return this.lo.set(t.name,(function(s){return{name:s.name,query:PT(s.bundledQuery),readTime:mt(s.readTime)}})(t)),C.resolve()}}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class LT{constructor(){this.overlays=new oe(F.comparator),this.Eo=new Map}getOverlay(e,t){return C.resolve(this.overlays.get(t))}getOverlays(e,t){const r=Gt();return C.forEach(t,(s=>this.getOverlay(e,s).next((i=>{i!==null&&r.set(s,i)})))).next((()=>r))}getAllOverlays(e,t){const r=Gt();return this.overlays.forEach(((s,i)=>{i.largestBatchId>t&&r.set(s,i)})),C.resolve(r)}saveOverlays(e,t,r){return r.forEach(((s,i)=>{this.Es(e,t,i)})),C.resolve()}removeOverlaysForBatchId(e,t,r){const s=this.Eo.get(r);return s!==void 0&&(s.forEach((i=>this.overlays=this.overlays.remove(i))),this.Eo.delete(r)),C.resolve()}getOverlaysForCollection(e,t,r){const s=Gt(),i=t.length+1,a=new F(t.child("")),c=this.overlays.getIteratorFrom(a);for(;c.hasNext();){const l=c.getNext().value,f=l.getKey();if(!t.isPrefixOf(f.path))break;f.path.length===i&&l.largestBatchId>r&&s.set(l.getKey(),l)}return C.resolve(s)}getOverlaysForCollectionGroup(e,t,r,s){let i=new oe(((f,d)=>f-d));const a=this.overlays.getIterator();for(;a.hasNext();){const f=a.getNext().value;if(f.getKey().getCollectionGroup()===t&&f.largestBatchId>r){let d=i.get(f.largestBatchId);d===null&&(d=Gt(),i=i.insert(f.largestBatchId,d)),d.set(f.getKey(),f)}}const c=Gt(),l=i.getIterator();for(;l.hasNext()&&(l.getNext().value.forEach(((f,d)=>c.set(f,d))),!(c.size()>=s)););return C.resolve(c)}Es(e,t,r){const s=this.overlays.get(r.key);if(s!==null){const a=this.Eo.get(s.largestBatchId).delete(r.key);this.Eo.set(s.largestBatchId,a)}this.overlays=this.overlays.insert(r.key,new bT(t,r));let i=this.Eo.get(t);i===void 0&&(i=Y(),this.Eo.set(t,i)),this.Eo.set(t,i.add(r.key))}}/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class MT{constructor(){this.sessionToken=ae.EMPTY_BYTE_STRING}getSessionToken(e){return C.resolve(this.sessionToken)}setSessionToken(e,t){return this.sessionToken=t,C.resolve()}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class hc{constructor(){this.ho=new pe(Ie.To),this.Po=new pe(Ie.Io)}isEmpty(){return this.ho.isEmpty()}addReference(e,t){const r=new Ie(e,t);this.ho=this.ho.add(r),this.Po=this.Po.add(r)}Ro(e,t){e.forEach((r=>this.addReference(r,t)))}removeReference(e,t){this.Ao(new Ie(e,t))}Vo(e,t){e.forEach((r=>this.removeReference(r,t)))}fo(e){const t=new F(new ee([])),r=new Ie(t,e),s=new Ie(t,e+1),i=[];return this.Po.forEachInRange([r,s],(a=>{this.Ao(a),i.push(a.key)})),i}mo(){this.ho.forEach((e=>this.Ao(e)))}Ao(e){this.ho=this.ho.delete(e),this.Po=this.Po.delete(e)}po(e){const t=new F(new ee([])),r=new Ie(t,e),s=new Ie(t,e+1);let i=Y();return this.Po.forEachInRange([r,s],(a=>{i=i.add(a.key)})),i}containsKey(e){const t=new Ie(e,0),r=this.ho.firstAfterOrEqual(t);return r!==null&&e.isEqual(r.key)}}class Ie{constructor(e,t){this.key=e,this.yo=t}static To(e,t){return F.comparator(e.key,t.key)||Q(e.yo,t.yo)}static Io(e,t){return Q(e.yo,t.yo)||F.comparator(e.key,t.key)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class UT{constructor(e,t){this.indexManager=e,this.referenceDelegate=t,this.mutationQueue=[],this.rs=1,this.wo=new pe(Ie.To)}checkEmpty(e){return C.resolve(this.mutationQueue.length===0)}addMutationBatch(e,t,r,s){const i=this.rs;this.rs++,this.mutationQueue.length>0&&this.mutationQueue[this.mutationQueue.length-1];const a=new IT(i,t,r,s);this.mutationQueue.push(a);for(const c of s)this.wo=this.wo.add(new Ie(c.key,i)),this.indexManager.addToCollectionParentIndex(e,c.key.path.popLast());return C.resolve(a)}lookupMutationBatch(e,t){return C.resolve(this.bo(t))}getNextMutationBatchAfterBatchId(e,t){const r=t+1,s=this.So(r),i=s<0?0:s;return C.resolve(this.mutationQueue.length>i?this.mutationQueue[i]:null)}getHighestUnacknowledgedBatchId(){return C.resolve(this.mutationQueue.length===0?Ca:this.rs-1)}getAllMutationBatches(e){return C.resolve(this.mutationQueue.slice())}getAllMutationBatchesAffectingDocumentKey(e,t){const r=new Ie(t,0),s=new Ie(t,Number.POSITIVE_INFINITY),i=[];return this.wo.forEachInRange([r,s],(a=>{const c=this.bo(a.yo);i.push(c)})),C.resolve(i)}getAllMutationBatchesAffectingDocumentKeys(e,t){let r=new pe(Q);return t.forEach((s=>{const i=new Ie(s,0),a=new Ie(s,Number.POSITIVE_INFINITY);this.wo.forEachInRange([i,a],(c=>{r=r.add(c.yo)}))})),C.resolve(this.xo(r))}getAllMutationBatchesAffectingQuery(e,t){const r=t.path,s=r.length+1;let i=r;F.isDocumentKey(i)||(i=i.child(""));const a=new Ie(new F(i),0);let c=new pe(Q);return this.wo.forEachWhile((l=>{const f=l.key.path;return!!r.isPrefixOf(f)&&(f.length===s&&(c=c.add(l.yo)),!0)}),a),C.resolve(this.xo(c))}xo(e){const t=[];return e.forEach((r=>{const s=this.bo(r);s!==null&&t.push(s)})),t}removeMutationBatch(e,t){U(this.vo(t.batchId,"removed")===0,55003),this.mutationQueue.shift();let r=this.wo;return C.forEach(t.mutations,(s=>{const i=new Ie(s.key,t.batchId);return r=r.delete(i),this.referenceDelegate.markPotentiallyOrphaned(e,s.key)})).next((()=>{this.wo=r}))}us(e){}containsKey(e,t){const r=new Ie(t,0),s=this.wo.firstAfterOrEqual(r);return C.resolve(t.isEqual(s&&s.key))}performConsistencyCheck(e){return this.mutationQueue.length,C.resolve()}vo(e,t){return this.So(e)}So(e){return this.mutationQueue.length===0?0:e-this.mutationQueue[0].batchId}bo(e){const t=this.So(e);return t<0||t>=this.mutationQueue.length?null:this.mutationQueue[t]}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class FT{constructor(e){this.Do=e,this.docs=(function(){return new oe(F.comparator)})(),this.size=0}setIndexManager(e){this.indexManager=e}addEntry(e,t){const r=t.key,s=this.docs.get(r),i=s?s.size:0,a=this.Do(t);return this.docs=this.docs.insert(r,{document:t.mutableCopy(),size:a}),this.size+=a-i,this.indexManager.addToCollectionParentIndex(e,r.path.popLast())}removeEntry(e){const t=this.docs.get(e);t&&(this.docs=this.docs.remove(e),this.size-=t.size)}getEntry(e,t){const r=this.docs.get(t);return C.resolve(r?r.document.mutableCopy():xe.newInvalidDocument(t))}getEntries(e,t){let r=Be();return t.forEach((s=>{const i=this.docs.get(s);r=r.insert(s,i?i.document.mutableCopy():xe.newInvalidDocument(s))})),C.resolve(r)}getAllEntries(e){let t=Be();return this.docs.forEach(((r,s)=>{t=t.insert(r,s.document)})),C.resolve(t)}getDocumentsMatchingQuery(e,t,r,s){let i,a;Ee(t)?(i=ee.fromString(no(t)),a=d=>io(t,d)):(i=t.path,a=d=>Yi(t,d));let c=Be();const l=new F(i.child("__id-9223372036854775808__")),f=this.docs.getIteratorFrom(l);for(;f.hasNext();){const{key:d,value:{document:m}}=f.getNext();if(!i.isPrefixOf(d.path))break;d.path.length>i.length+1||Cy(Sy(m),r)<=0||(s.has(m.key)||a(m))&&(c=c.insert(m.key,m.mutableCopy()))}return C.resolve(c)}getAllFromCollectionGroup(e,t,r,s){q(9500)}Co(e,t){return C.forEach(this.docs,(r=>t(r)))}newChangeBuffer(e){return new BT(this)}getSize(e){return C.resolve(this.size)}}class BT extends NT{constructor(e){super(),this.ao=e}applyChanges(e){const t=[];return this.changes.forEach(((r,s)=>{s.isValidDocument()?t.push(this.ao.addEntry(e,s)):this.ao.removeEntry(r)})),C.waitFor(t)}getFromCache(e,t){return this.ao.getEntry(e,t)}getAllFromCache(e,t){return this.ao.getEntries(e,t)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class qT{constructor(e){this.persistence=e,this.Fo=new Dn((t=>Ed(t)),wd),this.lastRemoteSnapshotVersion=G.min(),this.highestTargetId=0,this.Oo=0,this.Mo=new hc,this.targetCount=0,this.No=on.W_()}forEachTarget(e,t){return this.Fo.forEach(((r,s)=>t(s))),C.resolve()}getLastRemoteSnapshotVersion(e){return C.resolve(this.lastRemoteSnapshotVersion)}getHighestSequenceNumber(e){return C.resolve(this.Oo)}allocateTargetId(e){return this.highestTargetId=this.No.next(),C.resolve(this.highestTargetId)}setTargetsMetadata(e,t,r){return r&&(this.lastRemoteSnapshotVersion=r),t>this.Oo&&(this.Oo=t),C.resolve()}H_(e){this.Fo.set(e.target,e);const t=e.targetId;t>this.highestTargetId&&(this.No=new on(t),this.highestTargetId=t),e.sequenceNumber>this.Oo&&(this.Oo=e.sequenceNumber)}addTargetData(e,t){return this.H_(t),this.targetCount+=1,C.resolve()}updateTargetData(e,t){return this.H_(t),C.resolve()}removeTargetData(e,t){return this.Fo.delete(t.target),this.Mo.fo(t.targetId),this.targetCount-=1,C.resolve()}removeTargets(e,t,r){let s=0;const i=[];return this.Fo.forEach(((a,c)=>{c.sequenceNumber<=t&&r.get(c.targetId)===null&&(this.Fo.delete(a),i.push(this.removeMatchingKeysForTargetId(e,c.targetId)),s++)})),C.waitFor(i).next((()=>s))}getTargetCount(e){return C.resolve(this.targetCount)}getTargetData(e,t){const r=this.Fo.get(t)||null;return C.resolve(r)}addMatchingKeys(e,t,r){return this.Mo.Ro(t,r),C.resolve()}removeMatchingKeys(e,t,r){this.Mo.Vo(t,r);const s=this.persistence.referenceDelegate,i=[];return s&&t.forEach((a=>{i.push(s.markPotentiallyOrphaned(e,a))})),C.waitFor(i)}removeMatchingKeysForTargetId(e,t){return this.Mo.fo(t),C.resolve()}getMatchingKeysForTargetId(e,t){const r=this.Mo.po(t);return C.resolve(r)}containsKey(e,t){return C.resolve(this.Mo.containsKey(t))}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class vd{constructor(e,t){this.Bo={},this.overlays={},this.Lo=new Xi(0),this.$o=!1,this.$o=!0,this.Uo=new MT,this.referenceDelegate=e(this),this.ko=new qT(this),this.indexManager=new VT,this.remoteDocumentCache=(function(s){return new FT(s)})((r=>this.referenceDelegate.Qo(r))),this.serializer=new RT(t),this.qo=new OT(this.serializer)}start(){return Promise.resolve()}shutdown(){return this.$o=!1,Promise.resolve()}get started(){return this.$o}setDatabaseDeletedListener(){}setNetworkEnabled(){}getIndexManager(e){return this.indexManager}getDocumentOverlayCache(e){let t=this.overlays[e.toKey()];return t||(t=new LT,this.overlays[e.toKey()]=t),t}getMutationQueue(e,t){let r=this.Bo[e.toKey()];return r||(r=new UT(t,this.referenceDelegate),this.Bo[e.toKey()]=r),r}getGlobalsCache(){return this.Uo}getTargetCache(){return this.ko}getRemoteDocumentCache(){return this.remoteDocumentCache}getBundleCache(){return this.qo}runTransaction(e,t,r){L("MemoryPersistence","Starting transaction:",e);const s=new $T(this.Lo.next());return this.referenceDelegate.Ko(),r(s).next((i=>this.referenceDelegate.Wo(s).next((()=>i)))).toPromise().then((i=>(s.raiseOnCommittedEvent(),i)))}Go(e,t){return C.or(Object.values(this.Bo).map((r=>()=>r.containsKey(e,t))))}}class $T extends xE{constructor(e){super(),this.currentSequenceNumber=e}}class fc{constructor(e){this.persistence=e,this.jo=new hc,this.zo=null}static Ho(e){return new fc(e)}get Jo(){if(this.zo)return this.zo;throw q(60996)}addReference(e,t,r){return this.jo.addReference(r,t),this.Jo.delete(r.toString()),C.resolve()}removeReference(e,t,r){return this.jo.removeReference(r,t),this.Jo.add(r.toString()),C.resolve()}markPotentiallyOrphaned(e,t){return this.Jo.add(t.toString()),C.resolve()}removeTarget(e,t){this.jo.fo(t.targetId).forEach((s=>this.Jo.add(s.toString())));const r=this.persistence.getTargetCache();return r.getMatchingKeysForTargetId(e,t.targetId).next((s=>{s.forEach((i=>this.Jo.add(i.toString())))})).next((()=>r.removeTargetData(e,t)))}Ko(){this.zo=new Set}Wo(e){const t=this.persistence.getRemoteDocumentCache().newChangeBuffer();return C.forEach(this.Jo,(r=>{const s=F.fromPath(r);return this.Yo(e,s).next((i=>{i||t.removeEntry(s,G.min())}))})).next((()=>(this.zo=null,t.apply(e))))}updateLimboDocument(e,t){return this.Yo(e,t).next((r=>{r?this.Jo.delete(t.toString()):this.Jo.add(t.toString())}))}Qo(e){return 0}Yo(e,t){return C.or([()=>C.resolve(this.jo.containsKey(t)),()=>this.persistence.getTargetCache().containsKey(e,t),()=>this.persistence.Go(e,t)])}}class Li{constructor(e,t){this.persistence=e,this.Zo=new Dn((r=>vT(r.path)),((r,s)=>r.isEqual(s))),this.garbageCollector=ME(this,t)}static Ho(e,t){return new Li(e,t)}Ko(){}Wo(e){return C.resolve()}forEachTarget(e,t){return this.persistence.getTargetCache().forEachTarget(e,t)}Pi(e){const t=this.Y_(e);return this.persistence.getTargetCache().getTargetCount(e).next((r=>t.next((s=>r+s))))}Y_(e){let t=0;return this.Ii(e,(r=>{t++})).next((()=>t))}Ii(e,t){return C.forEach(this.Zo,((r,s)=>this.X_(e,r,s).next((i=>i?C.resolve():t(s)))))}removeTargets(e,t,r){return this.persistence.getTargetCache().removeTargets(e,t,r)}removeOrphanedDocuments(e,t){let r=0;const s=this.persistence.getRemoteDocumentCache(),i=s.newChangeBuffer();return s.Co(e,(a=>this.X_(e,a,t).next((c=>{c||(r++,i.removeEntry(a,G.min()))})))).next((()=>i.apply(e))).next((()=>r))}markPotentiallyOrphaned(e,t){return this.Zo.set(t,e.currentSequenceNumber),C.resolve()}removeTarget(e,t){const r=t.withSequenceNumber(e.currentSequenceNumber);return this.persistence.getTargetCache().updateTargetData(e,r)}addReference(e,t,r){return this.Zo.set(r,e.currentSequenceNumber),C.resolve()}removeReference(e,t,r){return this.Zo.set(r,e.currentSequenceNumber),C.resolve()}updateLimboDocument(e,t){return this.Zo.set(t,e.currentSequenceNumber),C.resolve()}Qo(e){let t=e.key.toString().length;return e.isFoundDocument()&&(t+=Vi(e.data.value)),t}X_(e,t,r){return C.or([()=>this.persistence.Go(e,t),()=>this.persistence.getTargetCache().containsKey(e,t),()=>{const s=this.Zo.get(t);return C.resolve(s!==void 0&&s>r)}])}getCacheSize(e){return this.persistence.getRemoteDocumentCache().getSize(e)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class dc{constructor(e,t,r,s){this.targetId=e,this.fromCache=t,this.$a=r,this.Ua=s}static ka(e,t){let r=Y(),s=Y();for(const i of t.docChanges)switch(i.type){case 0:r=r.add(i.doc.key);break;case 1:s=s.add(i.doc.key)}return new dc(e,t.fromCache,r,s)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function jT(n,e){return F.comparator(n.key,e.key)}/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class zT{constructor(){this._documentReadCount=0}get documentReadCount(){return this._documentReadCount}incrementDocumentReadCount(e){this._documentReadCount+=e}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class GT{constructor(){this.Qa=!1,this.qa=!1,this.Ka=100,this.Wa=(function(){return Hp()?8:NE(Ne())>0?6:4})()}initialize(e,t){this.Ga=e,this.indexManager=t,this.Qa=!0}getDocumentsMatchingQuery(e,t,r,s){const i={result:null};return this.ja(e,t).next((a=>{i.result=a})).next((()=>{if(!i.result)return this.za(e,t,s,r).next((a=>{i.result=a}))})).next((()=>{if(i.result)return;const a=new zT;return this.Ha(e,t,a).next((c=>{if(i.result=c,this.qa)return this.Ja(e,t,a,c.size)}))})).next((()=>i.result))}Ja(e,t,r,s){return Ee(t)?C.resolve():r.documentReadCount<this.Ka?(Bn()<=X.DEBUG&&L("QueryEngine","SDK will not create cache indexes for query:",Gr(t),"since it only creates cache indexes for collection contains","more than or equal to",this.Ka,"documents"),C.resolve()):(Bn()<=X.DEBUG&&L("QueryEngine","Query:",Gr(t),"scans",r.documentReadCount,"local documents and returns",s,"documents as results."),r.documentReadCount>this.Wa*s?(Bn()<=X.DEBUG&&L("QueryEngine","The SDK decides to create cache indexes for query:",Gr(t),"as using cache indexes may help improve performance."),this.indexManager.createTargetIndexes(e,pt(t))):C.resolve())}ja(e,t){if(Ee(t))return C.resolve(null);let r=t;if(Il(r))return C.resolve(null);let s=pt(r);return this.indexManager.getIndexType(e,s).next((i=>i===0?null:(r.limit!==null&&i===1&&(r=Ni(r,null,"F"),s=pt(r)),this.indexManager.getDocumentsMatchingTarget(e,s).next((a=>{const c=Y(...a);return this.Ga.getDocuments(e,c).next((l=>this.indexManager.getMinOffset(e,s).next((f=>{const d=this.Ya(r,l);return this.Za(r,d,c,f.readTime)?this.ja(e,Ni(r,null,"F")):this.Xa(e,d,r,f)}))))})))))}za(e,t,r,s){return(Ee(t)?(function(a){for(const c of a.stages){if(c instanceof ds||c instanceof Ul)return!1;if(c instanceof ec){if(c.condition instanceof od&&c.condition._expr.name==="exists"&&c.condition._expr.params[0]instanceof xs&&c.condition._expr.params[0].fieldName===er)continue;return!1}}return!0})(t):Il(t))||s.isEqual(G.min())?C.resolve(null):this.Ga.getDocuments(e,r).next((i=>{const a=this.Ya(t,i);return this.Za(t,a,r,s)?C.resolve(null):(Bn()<=X.DEBUG&&L("QueryEngine","Re-using previous result from %s to execute query: %s",s.toString(),Fl(t)),this.Xa(e,a,t,Vy(s,ls)).next((c=>c)))}))}Ya(e,t){let r,s;return Ee(e)?(r=new pe(jT),s=i=>io(e,i)):(r=new pe(Ma(e)),s=i=>Yi(e,i)),t.forEach(((i,a)=>{s(a)&&(r=r.add(a))})),r}Za(e,t,r,s){if(Ee(e))return(function(c){return c.stages.some((l=>l instanceof ds||l instanceof Ul))})(e);if(e.limit===null)return!1;if(r.size!==t.size)return!0;const i=e.limitType==="F"?t.last():t.first();return!!i&&(i.hasPendingWrites||i.version.compareTo(s)>0)}Ha(e,t,r){return Bn()<=X.DEBUG&&L("QueryEngine","Using full collection scan to execute query:",Fl(t)),this.Ga.getDocumentsMatchingQuery(e,t,nn.min(),r)}Xa(e,t,r,s){return this.Ga.getDocumentsMatchingQuery(e,r,s).next((i=>(t.forEach((a=>{i=i.insert(a.key,a)})),i)))}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const pc="LocalStore",WT=3e8;class HT{constructor(e,t,r,s){this.persistence=e,this.eu=t,this.serializer=s,this.tu=new oe(Q),this.nu=new Dn((i=>Ed(i)),wd),this.ru=new Map,this.iu=e.getRemoteDocumentCache(),this.ko=e.getTargetCache(),this.qo=e.getBundleCache(),this.su(r)}su(e){this.documentOverlayCache=this.persistence.getDocumentOverlayCache(e),this.indexManager=this.persistence.getIndexManager(e),this.mutationQueue=this.persistence.getMutationQueue(e,this.indexManager),this.localDocuments=new DT(this.iu,this.mutationQueue,this.documentOverlayCache,this.indexManager),this.iu.setIndexManager(this.indexManager),this.eu.initialize(this.localDocuments,this.indexManager)}collectGarbage(e){return this.persistence.runTransaction("Collect garbage","readwrite-primary",(t=>e.collect(t,this.tu)))}}function KT(n,e,t,r){return new HT(n,e,t,r)}async function Ad(n,e){const t=H(n);return await t.persistence.runTransaction("Handle user change","readonly",(r=>{let s;return t.mutationQueue.getAllMutationBatches(r).next((i=>(s=i,t.su(e),t.mutationQueue.getAllMutationBatches(r)))).next((i=>{const a=[],c=[];let l=Y();for(const f of s){a.push(f.batchId);for(const d of f.mutations)l=l.add(d.key)}for(const f of i){c.push(f.batchId);for(const d of f.mutations)l=l.add(d.key)}return t.localDocuments.getDocuments(r,l).next((f=>({_u:f,removedBatchIds:a,addedBatchIds:c})))}))}))}function QT(n,e){const t=H(n);return t.persistence.runTransaction("Acknowledge batch","readwrite-primary",(r=>{const s=e.batch.keys(),i=t.iu.newChangeBuffer({trackRemovals:!0});return(function(c,l,f,d){const m=f.batch,I=m.keys();let V=C.resolve();return I.forEach((x=>{V=V.next((()=>d.getEntry(l,x))).next((M=>{const O=f.docVersions.get(x);U(O!==null,48541),M.version.compareTo(O)<0&&(m.applyToRemoteDocument(M,f),M.isValidDocument()&&(M.setReadTime(f.commitVersion),d.addEntry(M)))}))})),V.next((()=>c.mutationQueue.removeMutationBatch(l,m)))})(t,r,e,i).next((()=>i.apply(r))).next((()=>t.mutationQueue.performConsistencyCheck(r))).next((()=>t.documentOverlayCache.removeOverlaysForBatchId(r,s,e.batch.batchId))).next((()=>t.localDocuments.recalculateAndSaveOverlaysForDocumentKeys(r,(function(c){let l=Y();for(let f=0;f<c.mutationResults.length;++f)c.mutationResults[f].transformResults.length>0&&(l=l.add(c.batch.mutations[f].key));return l})(e)))).next((()=>t.localDocuments.getDocuments(r,s)))}))}function bd(n){const e=H(n);return e.persistence.runTransaction("Get last remote snapshot version","readonly",(t=>e.ko.getLastRemoteSnapshotVersion(t)))}function YT(n,e){const t=H(n),r=e.snapshotVersion;let s=t.tu;return t.persistence.runTransaction("Apply remote event","readwrite-primary",(i=>{const a=t.iu.newChangeBuffer({trackRemovals:!0});s=t.tu;const c=[];e.targetChanges.forEach(((d,m)=>{const I=s.get(m);if(!I)return;c.push(t.ko.removeMatchingKeys(i,d.removedDocuments,m).next((()=>t.ko.addMatchingKeys(i,d.addedDocuments,m))));let V=I.withSequenceNumber(i.currentSequenceNumber);e.targetMismatches.get(m)!==null?V=V.withResumeToken(ae.EMPTY_BYTE_STRING,G.min()).withLastLimboFreeSnapshotVersion(G.min()):d.resumeToken.approximateByteSize()>0&&(V=V.withResumeToken(d.resumeToken,r)),s=s.insert(m,V),(function(M,O,W){return M.resumeToken.approximateByteSize()===0||O.snapshotVersion.toMicroseconds()-M.snapshotVersion.toMicroseconds()>=WT?!0:W.addedDocuments.size+W.modifiedDocuments.size+W.removedDocuments.size>0})(I,V,d)&&c.push(t.ko.updateTargetData(i,V))}));let l=Be(),f=Y();if(e.documentUpdates.forEach((d=>{e.resolvedLimboDocuments.has(d)&&c.push(t.persistence.referenceDelegate.updateLimboDocument(i,d))})),c.push(JT(i,a,e.documentUpdates).next((d=>{l=d.ou,f=d.au}))),!r.isEqual(G.min())){const d=t.ko.getLastRemoteSnapshotVersion(i).next((m=>t.ko.setTargetsMetadata(i,i.currentSequenceNumber,r)));c.push(d)}return C.waitFor(c).next((()=>a.apply(i))).next((()=>t.localDocuments.getLocalViewOfDocuments(i,l,f))).next((()=>l))})).then((i=>(t.tu=s,i)))}function JT(n,e,t){let r=Y(),s=Y();return t.forEach((i=>r=r.add(i))),e.getEntries(n,r).next((i=>{let a=Be();return t.forEach(((c,l)=>{const f=i.get(c);l.isFoundDocument()!==f.isFoundDocument()&&(s=s.add(c)),l.isNoDocument()&&l.version.isEqual(G.min())?(e.removeEntry(c,l.readTime),a=a.insert(c,l)):!f.isValidDocument()||l.version.compareTo(f.version)>0||l.version.compareTo(f.version)===0&&f.hasPendingWrites?(e.addEntry(l),a=a.insert(c,l)):L(pc,"Ignoring outdated watch update for ",c,". Current version:",f.version," Watch version:",l.version)})),{ou:a,au:s}}))}function XT(n,e){const t=H(n);return t.persistence.runTransaction("Get next mutation batch","readonly",(r=>(e===void 0&&(e=Ca),t.mutationQueue.getNextMutationBatchAfterBatchId(r,e))))}function ZT(n,e){const t=H(n);return t.persistence.runTransaction("Allocate target","readwrite",(r=>{let s;return t.ko.getTargetData(r,e).next((i=>i?(s=i,C.resolve(s)):t.ko.allocateTargetId(r).next((a=>(s=new bt(e,a,"TargetPurposeListen",r.currentSequenceNumber),t.ko.addTargetData(r,s).next((()=>s)))))))})).then((r=>{const s=t.tu.get(r.targetId);return(s===null||r.snapshotVersion.compareTo(s.snapshotVersion)>0)&&(t.tu=t.tu.insert(r.targetId,r),t.nu.set(e,r.targetId)),r}))}async function ua(n,e,t){const r=H(n),s=r.tu.get(e),i=t?"readwrite":"readwrite-primary";try{t||await r.persistence.runTransaction("Release target",i,(a=>r.persistence.referenceDelegate.removeTarget(a,s)))}catch(a){if(!dr(a))throw a;L(pc,`Failed to update sequence numbers for target ${e}: ${a}`)}r.tu=r.tu.remove(e),r.nu.delete(s.target)}function ql(n,e,t){const r=H(n);let s=G.min(),i=Y();return r.persistence.runTransaction("Execute query","readwrite",(a=>(function(l,f,d){const m=H(l),I=m.nu.get(d);return I!==void 0?C.resolve(m.tu.get(I)):m.ko.getTargetData(f,d)})(r,a,Ee(e)?e:pt(e)).next((c=>{if(c)return s=c.lastLimboFreeSnapshotVersion,r.ko.getMatchingKeysForTargetId(a,c.targetId).next((l=>{i=l}))})).next((()=>r.eu.getDocumentsMatchingQuery(a,e,t?s:G.min(),t?i:Y()))).next((c=>(e0(r,c),{documents:c,uu:i})))))}function e0(n,e){e.forEach(((t,r)=>{const s=r.key.getCollectionGroup(),i=n.ru.get(s)||G.min();r.readTime.compareTo(i)>0&&n.ru.set(s,r.readTime)}))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class t0{constructor(e,t){this.asyncQueue=e,this.onlineStateHandler=t,this.state="Unknown",this.Pu=0,this.Iu=null,this.Ru=!0}Au(){this.Pu===0&&(this.Vu("Unknown"),this.Iu=this.asyncQueue.enqueueAfterDelay("online_state_timeout",1e4,(()=>(this.Iu=null,this.du("Backend didn't respond within 10 seconds."),this.Vu("Offline"),Promise.resolve()))))}fu(e){this.state==="Online"?this.Vu("Unknown"):(this.Pu++,this.Pu>=1&&(this.mu(),this.du(`Connection failed 1 times. Most recent error: ${e.toString()}`),this.Vu("Offline")))}set(e){this.mu(),this.Pu=0,e==="Online"&&(this.Ru=!1),this.Vu(e)}Vu(e){e!==this.state&&(this.state=e,this.onlineStateHandler(e))}du(e){const t=`Could not reach Cloud Firestore backend. ${e}
This typically indicates that your device does not have a healthy Internet connection at the moment. The client will operate in offline mode until it is able to successfully connect to the backend.`;this.Ru?(Ct(t),this.Ru=!1):L("OnlineStateTracker",t)}mu(){this.Iu!==null&&(this.Iu.cancel(),this.Iu=null)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Et="RemoteStore";class n0{constructor(e,t,r,s,i){this.localStore=e,this.datastore=t,this.asyncQueue=r,this.remoteSyncer={},this.pu=[],this.gu=new Map,this.yu=new Map,this.wu=new Map,this.bu=new on(1e3),this.Su=new on(1001),this.xu=new Set,this.vu=[],this.Du=i,this.Du.tn((a=>{r.enqueueAndForget((async()=>{Ln(this)&&(L(Et,"Restarting streams for network reachability change."),await(async function(l){const f=H(l);f.xu.add(4),await ks(f),f.Cu.set("Unknown"),f.xu.delete(4),await oo(f)})(this))}))})),this.Cu=new t0(r,s)}}async function oo(n){if(Ln(n))for(const e of n.vu)await e(!0)}async function ks(n){for(const e of n.vu)await e(!1)}function la(n,e){return n.yu.get(e)||void 0}function Rd(n,e){const t=H(n),r=la(t,e.targetId);if(r!==void 0&&t.gu.has(r))return;const s=(function(c,l){const f=la(c,l);f!==void 0&&c.wu.delete(f);const d=(function(I,V){return V%2!=0?I.Su.next():I.bu.next()})(c,l);return c.yu.set(l,d),c.wu.set(d,l),d})(t,e.targetId);L(Et,"remoteStoreListen mapping SDK target ID to remote",e.targetId,s);const i=new bt(e.target,s,e.purpose,e.sequenceNumber,e.snapshotVersion,e.lastLimboFreeSnapshotVersion,e.resumeToken);t.gu.set(s,i),yc(t)?_c(t):_r(t).ur()&&gc(t,i)}function mc(n,e){const t=H(n),r=_r(t),s=la(t,e);L(Et,"remoteStoreUnlisten removing mapping of SDK target ID to remote",e,s),t.gu.delete(s),t.yu.delete(e),t.wu.delete(s),r.ur()&&Pd(t,s),t.gu.size===0&&(r.ur()?r.Er():Ln(t)&&t.Cu.set("Unknown"))}function gc(n,e){if(n.Fu.rt(e.targetId),e.resumeToken.approximateByteSize()>0||e.snapshotVersion.compareTo(G.min())>0){const t=n.wu.get(e.targetId);if(t===void 0)return void L(Et,"SDK target ID not found for remote ID: "+e.targetId);const r=n.remoteSyncer.getRemoteKeysForTarget(t).size;e=e.withExpectedCount(r)}_r(n).yr(e)}function Pd(n,e){n.Fu.rt(e),_r(n).wr(e)}function _c(n){n.Fu=new Hy({getRemoteKeysForTarget:e=>{const t=n.wu.get(e);return t!==void 0?n.remoteSyncer.getRemoteKeysForTarget(t):Y()},Mt:e=>n.gu.get(e)||null,xt:()=>n.datastore.serializer.databaseId}),_r(n).start(),n.Cu.Au()}function yc(n){return Ln(n)&&!_r(n).ar()&&n.gu.size>0}function Ln(n){return H(n).xu.size===0}function Vd(n){n.Fu=void 0}async function r0(n){n.Cu.set("Online")}async function s0(n){n.gu.forEach(((e,t)=>{gc(n,e)}))}async function i0(n,e){Vd(n),yc(n)?(n.Cu.fu(e),_c(n)):n.Cu.set("Unknown")}async function o0(n,e,t){if(n.Cu.set("Online"),e instanceof Uf&&e.state===2&&e.cause)try{await(async function(s,i){const a=i.cause;for(const c of i.targetIds){if(s.gu.has(c)){const l=s.wu.get(c);l!==void 0&&(await s.remoteSyncer.rejectListen(l,a),s.yu.delete(l),s.wu.delete(c)),s.gu.delete(c)}s.Fu.removeTarget(c)}})(n,e)}catch(r){L(Et,"Failed to remove targets %s: %s ",e.targetIds.join(","),r),await Mi(n,r)}else if(e instanceof fi?n.Fu.Tt(e):e instanceof Mf?n.Fu.ft(e):n.Fu.Rt(e),!t.isEqual(G.min()))try{const r=await bd(n.localStore);t.compareTo(r)>=0&&await(function(i,a){const c=i.Fu.Dt(a);c.targetChanges.forEach(((f,d)=>{if(f.resumeToken.approximateByteSize()>0){const m=i.gu.get(d);m&&i.gu.set(d,m.withResumeToken(f.resumeToken,a))}})),c.targetMismatches.forEach(((f,d)=>{const m=i.gu.get(f);if(!m)return;i.gu.set(f,m.withResumeToken(ae.EMPTY_BYTE_STRING,m.snapshotVersion)),Pd(i,f);const I=new bt(m.target,f,d,m.sequenceNumber);gc(i,I)}));const l=(function(d,m){const I=new Map;m.targetChanges.forEach(((x,M)=>{const O=d.wu.get(M);O!==void 0&&I.set(O,x)}));let V=new oe(Q);return m.targetMismatches.forEach(((x,M)=>{const O=d.wu.get(x);O!==void 0&&(V=V.insert(O,M))})),new Vs(m.snapshotVersion,I,V,m.documentUpdates,m.augmentedDocumentUpdates,m.resolvedLimboDocuments)})(i,c);return i.remoteSyncer.applyRemoteEvent(l)})(n,t)}catch(r){L(Et,"Failed to raise snapshot:",r),await Mi(n,r)}}async function Mi(n,e,t){if(!dr(e))throw e;n.xu.add(1),await ks(n),n.Cu.set("Offline"),t||(t=()=>bd(n.localStore)),n.asyncQueue.enqueueRetryable((async()=>{L(Et,"Retrying IndexedDB access"),await t(),n.xu.delete(1),await oo(n)}))}function Sd(n,e){return e().catch((t=>Mi(n,t,e)))}async function ao(n){const e=H(n),t=an(e);let r=e.pu.length>0?e.pu[e.pu.length-1].batchId:Ca;for(;a0(e);)try{const s=await XT(e.localStore,r);if(s===null){e.pu.length===0&&t.Er();break}r=s.batchId,c0(e,s)}catch(s){await Mi(e,s)}Cd(e)&&xd(e)}function a0(n){return Ln(n)&&n.pu.length<10}function c0(n,e){n.pu.push(e);const t=an(n);t.ur()&&t.br&&t.Sr(e.mutations)}function Cd(n){return Ln(n)&&!an(n).ar()&&n.pu.length>0}function xd(n){an(n).start()}async function u0(n){an(n).Cr()}async function l0(n){const e=an(n);for(const t of n.pu)e.Sr(t.mutations)}async function h0(n,e,t){const r=n.pu.shift(),s=lc.from(r,e,t);await Sd(n,(()=>n.remoteSyncer.applySuccessfulWrite(s))),await ao(n)}async function f0(n,e){e&&an(n).br&&await(async function(r,s){if((function(a){return Fy(a)&&a!==S.ABORTED})(s.code)){const i=r.pu.shift();an(r).lr(),await Sd(r,(()=>r.remoteSyncer.rejectFailedWrite(i.batchId,s))),await ao(r)}})(n,e),Cd(n)&&xd(n)}async function $l(n,e){const t=H(n);t.asyncQueue.verifyOperationInProgress(),L(Et,"RemoteStore received new credentials");const r=Ln(t);t.xu.add(3),await ks(t),r&&t.Cu.set("Unknown"),await t.remoteSyncer.handleCredentialChange(e),t.xu.delete(3),await oo(t)}async function d0(n,e){const t=H(n);e?(t.xu.delete(2),await oo(t)):e||(t.xu.add(2),await ks(t),t.Cu.set("Unknown"))}function _r(n){return n.Ou||(n.Ou=(function(t,r,s){const i=H(t);return i.Or(),new vE(r,i.connection,i.authCredentials,i.appCheckCredentials,i.serializer,s)})(n.datastore,n.asyncQueue,{pn:r0.bind(null,n),yn:s0.bind(null,n),bn:i0.bind(null,n),gr:o0.bind(null,n)}),n.vu.push((async e=>{e?(n.Ou.lr(),yc(n)?_c(n):n.Cu.set("Unknown")):(await n.Ou.stop(),Vd(n))}))),n.Ou}function an(n){return n.Mu||(n.Mu=(function(t,r,s){const i=H(t);return i.Or(),new AE(r,i.connection,i.authCredentials,i.appCheckCredentials,i.serializer,s)})(n.datastore,n.asyncQueue,{pn:()=>Promise.resolve(),yn:u0.bind(null,n),bn:f0.bind(null,n),vr:l0.bind(null,n),Dr:h0.bind(null,n)}),n.vu.push((async e=>{e?(n.Mu.lr(),await ao(n)):(await n.Mu.stop(),n.pu.length>0&&(L(Et,`Stopping write stream with ${n.pu.length} pending writes`),n.pu=[]))}))),n.Mu}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Nd{constructor(e){this.observer=e,this.muted=!1}next(e){this.muted||this.observer.next&&this.Nu(this.observer.next,e)}error(e){this.muted||(this.observer.error?this.Nu(this.observer.error,e):Ct("Uncaught Error in snapshot listener:",e.toString()))}Bu(){this.muted=!0}Nu(e,t){setTimeout((()=>{this.muted||e(t)}),0)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ec{constructor(e,t,r,s,i){this.asyncQueue=e,this.timerId=t,this.targetTimeMs=r,this.op=s,this.removalCallback=i,this.deferred=new Qt,this.then=this.deferred.promise.then.bind(this.deferred.promise),this.deferred.promise.catch((a=>{}))}get promise(){return this.deferred.promise}static createAndSchedule(e,t,r,s,i){const a=Date.now()+r,c=new Ec(e,t,a,s,i);return c.start(r),c}start(e){this.timerHandle=setTimeout((()=>this.handleDelayElapsed()),e)}skipDelay(){return this.handleDelayElapsed()}cancel(e){this.timerHandle!==null&&(this.clearTimeout(),this.deferred.reject(new D(S.CANCELLED,"Operation cancelled"+(e?": "+e:""))))}handleDelayElapsed(){this.asyncQueue.enqueueAndForget((()=>this.timerHandle!==null?(this.clearTimeout(),this.op().then((e=>this.deferred.resolve(e)))):Promise.resolve()))}clearTimeout(){this.timerHandle!==null&&(this.removalCallback(this),clearTimeout(this.timerHandle),this.timerHandle=null)}}function wc(n,e){if(Ct("AsyncQueue",`${e}: ${n}`),dr(n))return new D(S.UNAVAILABLE,`${e}: ${n}`);throw n}class jl{constructor(){this.activeTargetIds=zy()}nc(e){this.activeTargetIds=this.activeTargetIds.add(e)}rc(e){this.activeTargetIds=this.activeTargetIds.delete(e)}tc(){const e={activeTargetIds:this.activeTargetIds.toArray(),updateTimeMs:Date.now()};return JSON.stringify(e)}}class p0{constructor(){this.kc=new jl,this.Qc={},this.onlineStateHandler=null,this.sequenceNumberHandler=null}addPendingMutation(e){}updateMutationState(e,t,r){}addLocalQueryTarget(e,t=!0){return t&&this.kc.nc(e),this.Qc[e]||"not-current"}updateQueryState(e,t,r){this.Qc[e]=t}removeLocalQueryTarget(e){this.kc.rc(e)}isLocalQueryTarget(e){return this.kc.activeTargetIds.has(e)}clearQueryState(e){delete this.Qc[e]}getAllActiveQueryTargets(){return this.kc.activeTargetIds}isActiveQueryTarget(e){return this.kc.activeTargetIds.has(e)}start(){return this.kc=new jl,Promise.resolve()}handleUserChange(e,t,r){}setOnlineState(e){}shutdown(){}writeSequenceNumber(e){}notifyBundleLoaded(e){}}function $o(){return typeof document<"u"?document:null}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class vn{static emptySet(e){return new vn(e.comparator)}constructor(e){this.comparator=e?(t,r)=>e(t,r)||F.comparator(t.key,r.key):(t,r)=>F.comparator(t.key,r.key),this.keyedMap=$n(),this.sortedSet=new oe(this.comparator)}has(e){return this.keyedMap.get(e)!=null}get(e){return this.keyedMap.get(e)}first(){return this.sortedSet.minKey()}last(){return this.sortedSet.maxKey()}isEmpty(){return this.sortedSet.isEmpty()}indexOf(e){const t=this.keyedMap.get(e);return t?this.sortedSet.indexOf(t):-1}get size(){return this.sortedSet.size}forEach(e){this.sortedSet.inorderTraversal(((t,r)=>(e(t),!1)))}add(e){const t=this.delete(e.key);return t.copy(t.keyedMap.insert(e.key,e),t.sortedSet.insert(e,null))}delete(e){const t=this.get(e);return t?this.copy(this.keyedMap.remove(e),this.sortedSet.remove(t)):this}isEqual(e){if(!(e instanceof vn)||this.size!==e.size)return!1;const t=this.sortedSet.getIterator(),r=e.sortedSet.getIterator();for(;t.hasNext();){const s=t.getNext().key,i=r.getNext().key;if(!s.isEqual(i))return!1}return!0}toString(){const e=[];return this.forEach((t=>{e.push(t.toString())})),e.length===0?"DocumentSet ()":`DocumentSet (
  `+e.join(`  
`)+`
)`}copy(e,t){const r=new vn;return r.comparator=this.comparator,r.keyedMap=e,r.sortedSet=t,r}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class zl{constructor(){this.qc=new oe(F.comparator)}track(e){const t=e.doc.key,r=this.qc.get(t);r?e.type!==0&&r.type===3?this.qc=this.qc.insert(t,e):e.type===3&&r.type!==1?this.qc=this.qc.insert(t,{type:r.type,doc:e.doc}):e.type===2&&r.type===2?this.qc=this.qc.insert(t,{type:2,doc:e.doc}):e.type===2&&r.type===0?this.qc=this.qc.insert(t,{type:0,doc:e.doc}):e.type===1&&r.type===0?this.qc=this.qc.remove(t):e.type===1&&r.type===2?this.qc=this.qc.insert(t,{type:1,doc:r.doc}):e.type===0&&r.type===1?this.qc=this.qc.insert(t,{type:2,doc:e.doc}):q(63341,{Nt:e,Kc:r}):this.qc=this.qc.insert(t,e)}Wc(){const e=[];return this.qc.inorderTraversal(((t,r)=>{e.push(r)})),e}}class or{constructor(e,t,r,s,i,a,c,l,f){this.query=e,this.docs=t,this.oldDocs=r,this.docChanges=s,this.mutatedKeys=i,this.fromCache=a,this.syncStateChanged=c,this.excludesMetadataChanges=l,this.hasCachedResults=f}static fromInitialDocuments(e,t,r,s,i){const a=[];return t.forEach((c=>{a.push({type:0,doc:c})})),new or(e,t,vn.emptySet(t),a,r,s,!0,!1,i)}get hasPendingWrites(){return!this.mutatedKeys.isEmpty()}isEqual(e){if(!(this.fromCache===e.fromCache&&this.hasCachedResults===e.hasCachedResults&&this.syncStateChanged===e.syncStateChanged&&this.mutatedKeys.isEqual(e.mutatedKeys)&&so(this.query,e.query)&&this.docs.isEqual(e.docs)&&this.oldDocs.isEqual(e.oldDocs)))return!1;const t=this.docChanges,r=e.docChanges;if(t.length!==r.length)return!1;for(let s=0;s<t.length;s++)if(t[s].type!==r[s].type||!t[s].doc.isEqual(r[s].doc))return!1;return!0}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class m0{constructor(){this.Gc=void 0,this.jc=[]}zc(){return this.jc.some((e=>e.Hc()))}}class g0{constructor(){this.queries=Gl(),this.onlineState="Unknown",this.Jc=new Set}terminate(){(function(t,r){const s=H(t),i=s.queries;s.queries=Gl(),i.forEach(((a,c)=>{for(const l of c.jc)l.onError(r)}))})(this,new D(S.ABORTED,"Firestore shutting down"))}}function Gl(){return new Dn((n=>yd(n)),so)}async function kd(n,e){const t=H(n);let r=3;const s=e.query;let i=t.queries.get(s);i?!i.zc()&&e.Hc()&&(r=2):(i=new m0,r=e.Hc()?0:1);try{switch(r){case 0:i.Gc=await t.onListen(s,!0);break;case 1:i.Gc=await t.onListen(s,!1);break;case 2:await t.onFirstRemoteStoreListen(s)}}catch(a){const c=wc(a,`Initialization of query '${Ee(e.query)?Pt(e.query):Gr(e.query)}' failed`);return void e.onError(c)}t.queries.set(s,i),i.jc.push(e),e.Yc(t.onlineState),i.Gc&&e.Zc(i.Gc)&&Tc(t)}async function Dd(n,e){const t=H(n),r=e.query;let s=3;const i=t.queries.get(r);if(i){const a=i.jc.indexOf(e);a>=0&&(i.jc.splice(a,1),i.jc.length===0?s=e.Hc()?0:1:!i.zc()&&e.Hc()&&(s=2))}switch(s){case 0:return t.queries.delete(r),t.onUnlisten(r,!0);case 1:return t.queries.delete(r),t.onUnlisten(r,!1);case 2:return t.onLastRemoteStoreUnlisten(r);default:return}}function _0(n,e){const t=H(n);let r=!1;for(const s of e){const i=s.query,a=t.queries.get(i);if(a){for(const c of a.jc)c.Zc(s)&&(r=!0);a.Gc=s}}r&&Tc(t)}function y0(n,e,t){const r=H(n),s=r.queries.get(e);if(s)for(const i of s.jc)i.onError(t);r.queries.delete(e)}function Tc(n){n.Jc.forEach((e=>{e.next()}))}var ha;(function(n){n.Default="default",n.Cache="cache"})(ha||(ha={}));class Od{constructor(e,t,r){this.query=e,this.Xc=t,this.el=!1,this.tl=null,this.onlineState="Unknown",this.options=r||{}}Zc(e){if(!this.options.includeMetadataChanges){const r=[];for(const s of e.docChanges)s.type!==3&&r.push(s);e=new or(e.query,e.docs,e.oldDocs,r,e.mutatedKeys,e.fromCache,e.syncStateChanged,!0,e.hasCachedResults)}let t=!1;return this.el?this.nl(e)&&(this.Xc.next(e),t=!0):this.rl(e,this.onlineState)&&(this.il(e),t=!0),this.tl=e,t}onError(e){this.Xc.error(e)}Yc(e){this.onlineState=e;let t=!1;return this.tl&&!this.el&&this.rl(this.tl,e)&&(this.il(this.tl),t=!0),t}rl(e,t){if(!e.fromCache||!this.Hc())return!0;const r=t!=="Offline";return(!this.options.waitForSyncWhenOnline||!r)&&(!e.docs.isEmpty()||e.hasCachedResults||t==="Offline")}nl(e){if(e.docChanges.length>0)return!0;const t=this.tl&&this.tl.hasPendingWrites!==e.hasPendingWrites;return!(!e.syncStateChanged&&!t)&&this.options.includeMetadataChanges===!0}il(e){e=or.fromInitialDocuments(e.query,e.docs,e.mutatedKeys,e.fromCache,e.hasCachedResults),this.el=!0,this.Xc.next(e)}Hc(){return this.options.source!==ha.Cache}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ld{constructor(e){this.key=e}}class Md{constructor(e){this.key=e}}class E0{constructor(e,t){this.query=e,this.hl=t,this.Tl=null,this.hasCachedResults=!1,this.current=!1,this.Pl=Y(),this.mutatedKeys=Y(),this.Il=Ee(e)?ca(e):Ma(e),this.Rl=new vn(this.Il)}get Al(){return this.hl}Vl(e,t){const r=t?t.dl:new zl,s=t?t.Rl:this.Rl;let i=t?t.mutatedKeys:this.mutatedKeys,a=s,c=!1;const[l,f]=this.fl(this.query,s);e.inorderTraversal(((m,I)=>{const V=s.get(m),x=CT(this.query,I)?I:null,M=!!V&&this.mutatedKeys.has(V.key),O=!!x&&(x.hasLocalMutations||this.mutatedKeys.has(x.key)&&x.hasCommittedMutations);let W=!1;V&&x?V.data.isEqual(x.data)?M!==O&&(r.track({type:3,doc:x}),W=!0):this.ml(V,x)||(r.track({type:2,doc:x}),W=!0,(l&&this.Il(x,l)>0||f&&this.Il(x,f)<0)&&(c=!0)):!V&&x?(r.track({type:0,doc:x}),W=!0):V&&!x&&(r.track({type:1,doc:V}),W=!0,(l||f)&&(c=!0)),W&&(x?(a=a.add(x),i=O?i.add(m):i.delete(m)):(a=a.delete(m),i=i.delete(m)))}));const d=this.pl(this.query);if(d)if(Ee(this.query)){const m=[];a.forEach((x=>m.push(x)));const I=Id(this.query,m);let V=new vn(ca(this.query));for(const x of I)V=V.add(x);a.forEach((x=>{V.has(x.key)||(i=i.delete(x.key),r.track({type:1,doc:x}))})),a=V}else{const m=this.gl(this.query);for(;a.size>d;){const I=m==="F"?a.last():a.first();a=a.delete(I.key),i=i.delete(I.key),r.track({type:1,doc:I})}}return{Rl:a,dl:r,Za:c,mutatedKeys:i}}pl(e){var t;return Ee(e)?(t=qo(e))==null?void 0:t.limit:e.limit||void 0}gl(e){if(Ee(e)){const t=qo(e);return t&&t.limit<0?"L":"F"}return e.limitType}fl(e,t){var r;if(Ee(e)){const s=(r=qo(e))==null?void 0:r.limit;return[t.size===s?t.last():null,null]}return[e.limitType==="F"&&t.size===this.pl(this.query)?t.last():null,e.limitType==="L"&&t.size===this.pl(this.query)?t.first():null]}ml(e,t){return e.hasLocalMutations&&t.hasCommittedMutations&&!t.hasLocalMutations}applyChanges(e,t,r,s){const i=this.Rl;this.Rl=e.Rl,this.mutatedKeys=e.mutatedKeys;const a=e.dl.Wc();a.sort(((d,m)=>(function(V,x){const M=O=>{switch(O){case 0:return 1;case 2:case 3:return 2;case 1:return 0;default:return q(20277,{Nt:O})}};return M(V)-M(x)})(d.type,m.type)||this.Il(d.doc,m.doc))),this.yl(r),s=s??!1;const c=t&&!s?this.wl():[],l=this.Pl.size===0&&this.current&&!s?1:0,f=l!==this.Tl;return this.Tl=l,a.length!==0||f?{snapshot:new or(this.query,e.Rl,i,a,e.mutatedKeys,l===0,f,!1,!!r&&r.resumeToken.approximateByteSize()>0),bl:c}:{bl:c}}Yc(e){return this.current&&e==="Offline"?(this.current=!1,this.applyChanges({Rl:this.Rl,dl:new zl,mutatedKeys:this.mutatedKeys,Za:!1},!1)):{bl:[]}}Sl(e){return!this.hl.has(e)&&!!this.Rl.has(e)&&!this.Rl.get(e).hasLocalMutations}yl(e){e&&(e.addedDocuments.forEach((t=>this.hl=this.hl.add(t))),e.modifiedDocuments.forEach((t=>{})),e.removedDocuments.forEach((t=>this.hl=this.hl.delete(t))),this.current=e.current)}wl(){if(!this.current)return[];const e=this.Pl;this.Pl=Y(),this.Rl.forEach((r=>{this.Sl(r.key)&&(this.Pl=this.Pl.add(r.key))}));const t=[];return e.forEach((r=>{this.Pl.has(r)||t.push(new Md(r))})),this.Pl.forEach((r=>{e.has(r)||t.push(new Ld(r))})),t}xl(e){this.hl=e.uu,this.Pl=Y();const t=this.Vl(e.documents);return this.applyChanges(t,!0)}vl(){return or.fromInitialDocuments(this.query,this.Rl,this.mutatedKeys,this.Tl===0,this.hasCachedResults)}}const Ic="SyncEngine";class w0{constructor(e,t,r){this.query=e,this.targetId=t,this.view=r}}class T0{constructor(e){this.key=e,this.Dl=!1}}class I0{constructor(e,t,r,s,i,a){this.localStore=e,this.remoteStore=t,this.eventManager=r,this.sharedClientState=s,this.currentUser=i,this.maxConcurrentLimboResolutions=a,this.Cl={},this.Fl=new Dn((c=>yd(c)),so),this.Ol=new Map,this.Ml=new Set,this.Nl=new oe(F.comparator),this.Bl=new Map,this.Ll=new hc,this.$l={},this.Ul=new Map,this.kl=on.G_(),this.onlineState="Unknown",this.Ql=void 0}get isPrimaryClient(){return this.Ql===!0}}async function v0(n,e,t=!0){const r=jd(n);let s;const i=r.Fl.get(e);return i?(r.sharedClientState.addLocalQueryTarget(i.targetId),s=i.view.vl()):s=await Ud(r,e,t,!0),s}async function A0(n,e){const t=jd(n);await Ud(t,e,!0,!1)}async function Ud(n,e,t,r){const s=await ZT(n.localStore,Ee(e)?e:pt(e)),i=s.targetId,a=n.sharedClientState.addLocalQueryTarget(i,t);let c;return r&&(c=await b0(n,e,i,a==="current",s.resumeToken)),n.isPrimaryClient&&t&&Rd(n.remoteStore,s),c}async function b0(n,e,t,r,s){n.ql=(m,I,V)=>(async function(M,O,W,J){let se=O.view.Vl(W);se.Za&&(se=await ql(M.localStore,O.query,!1).then((({documents:T})=>O.view.Vl(T,se))));const De=J&&J.targetChanges.get(O.targetId),ge=J&&J.targetMismatches.get(O.targetId)!=null,_e=O.view.applyChanges(se,M.isPrimaryClient,De,ge);return Hl(M,O.targetId,_e.bl),_e.snapshot})(n,m,I,V);const i=await ql(n.localStore,e,!0),a=new E0(e,i.uu),c=a.Vl(i.documents),l=Ss.createSynthesizedTargetChangeForCurrentChange(t,r&&n.onlineState!=="Offline",s),f=a.applyChanges(c,n.isPrimaryClient,l);Hl(n,t,f.bl);const d=new w0(e,t,a);return n.Fl.set(e,d),n.Ol.has(t)?n.Ol.get(t).push(e):n.Ol.set(t,[e]),f.snapshot}async function R0(n,e,t){const r=H(n),s=r.Fl.get(e),i=r.Ol.get(s.targetId);if(i.length>1)return r.Ol.set(s.targetId,i.filter((a=>!so(a,e)))),void r.Fl.delete(e);r.isPrimaryClient?(r.sharedClientState.removeLocalQueryTarget(s.targetId),r.sharedClientState.isActiveQueryTarget(s.targetId)||await ua(r.localStore,s.targetId,!1).then((()=>{r.sharedClientState.clearQueryState(s.targetId),t&&mc(r.remoteStore,s.targetId),fa(r,s.targetId)})).catch(fr)):(fa(r,s.targetId),await ua(r.localStore,s.targetId,!0))}async function P0(n,e){const t=H(n),r=t.Fl.get(e),s=t.Ol.get(r.targetId);t.isPrimaryClient&&s.length===1&&(t.sharedClientState.removeLocalQueryTarget(r.targetId),mc(t.remoteStore,r.targetId))}async function V0(n,e,t){const r=O0(n);try{const s=await(function(a,c){const l=H(a),f=te.now(),d=c.reduce(((V,x)=>V.add(x.key)),Y());let m,I;return l.persistence.runTransaction("Locally write mutations","readwrite",(V=>{let x=Be(),M=Y();return l.iu.getEntries(V,d).next((O=>{x=O,x.forEach(((W,J)=>{J.isValidDocument()||(M=M.add(W))}))})).next((()=>l.localDocuments.getOverlayedDocuments(V,x))).next((O=>{m=O;const W=[];for(const J of c){const se=_y(J,m.get(J.key).overlayedDocument);se!=null&&W.push(new kn(J.key,se,mf(se.value.mapValue),dt.exists(!0)))}return l.mutationQueue.addMutationBatch(V,f,W,c)})).next((O=>{I=O;const W=O.applyToLocalDocumentSet(m,M);return l.documentOverlayCache.saveOverlays(V,O.batchId,W)}))})).then((()=>({batchId:I.batchId,changes:Of(m)})))})(r.localStore,e);r.sharedClientState.addPendingMutation(s.batchId),(function(a,c,l){let f=a.$l[a.currentUser.toKey()];f||(f=new oe(Q)),f=f.insert(c,l),a.$l[a.currentUser.toKey()]=f})(r,s.batchId,t),await Ds(r,s.changes),await ao(r.remoteStore)}catch(s){const i=wc(s,"Failed to persist write");t.reject(i)}}async function Fd(n,e){const t=H(n);try{const r=await YT(t.localStore,e);e.targetChanges.forEach(((s,i)=>{const a=t.Bl.get(i);a&&(U(s.addedDocuments.size+s.modifiedDocuments.size+s.removedDocuments.size<=1,22616),s.addedDocuments.size>0?a.Dl=!0:s.modifiedDocuments.size>0?U(a.Dl,14607):s.removedDocuments.size>0&&(U(a.Dl,42227),a.Dl=!1))})),await Ds(t,r,e)}catch(r){await fr(r)}}function Wl(n,e,t){const r=H(n);if(r.isPrimaryClient&&t===0||!r.isPrimaryClient&&t===1){const s=[];r.Fl.forEach(((i,a)=>{const c=a.view.Yc(e);c.snapshot&&s.push(c.snapshot)})),(function(a,c){const l=H(a);l.onlineState=c;let f=!1;l.queries.forEach(((d,m)=>{for(const I of m.jc)I.Yc(c)&&(f=!0)})),f&&Tc(l)})(r.eventManager,e),s.length&&r.Cl.gr(s),r.onlineState=e,r.isPrimaryClient&&r.sharedClientState.setOnlineState(e)}}async function S0(n,e,t){const r=H(n);r.sharedClientState.updateQueryState(e,"rejected",t);const s=r.Bl.get(e),i=s&&s.key;if(i){let a=new oe(F.comparator);a=a.insert(i,xe.newNoDocument(i,G.min()));const c=Y().add(i),l=new Vs(G.min(),new Map,new oe(Q),a,Be(),c);await Fd(r,l),r.Nl=r.Nl.remove(i),r.Bl.delete(e),vc(r)}else await ua(r.localStore,e,!1).then((()=>fa(r,e,t))).catch(fr)}async function C0(n,e){const t=H(n),r=e.batch.batchId;try{const s=await QT(t.localStore,e);qd(t,r,null),Bd(t,r),t.sharedClientState.updateMutationState(r,"acknowledged"),await Ds(t,s)}catch(s){await fr(s)}}async function x0(n,e,t){const r=H(n);try{const s=await(function(a,c){const l=H(a);return l.persistence.runTransaction("Reject batch","readwrite-primary",(f=>{let d;return l.mutationQueue.lookupMutationBatch(f,c).next((m=>(U(m!==null,37113),d=m.keys(),l.mutationQueue.removeMutationBatch(f,m)))).next((()=>l.mutationQueue.performConsistencyCheck(f))).next((()=>l.documentOverlayCache.removeOverlaysForBatchId(f,d,c))).next((()=>l.localDocuments.recalculateAndSaveOverlaysForDocumentKeys(f,d))).next((()=>l.localDocuments.getDocuments(f,d)))}))})(r.localStore,e);qd(r,e,t),Bd(r,e),r.sharedClientState.updateMutationState(e,"rejected",t),await Ds(r,s)}catch(s){await fr(s)}}function Bd(n,e){(n.Ul.get(e)||[]).forEach((t=>{t.resolve()})),n.Ul.delete(e)}function qd(n,e,t){const r=H(n);let s=r.$l[r.currentUser.toKey()];if(s){const i=s.get(e);i&&(t?i.reject(t):i.resolve(),s=s.remove(e)),r.$l[r.currentUser.toKey()]=s}}function fa(n,e,t=null){n.sharedClientState.removeLocalQueryTarget(e);for(const r of n.Ol.get(e))n.Fl.delete(r),t&&n.Cl.Kl(r,t);n.Ol.delete(e),n.isPrimaryClient&&n.Ll.fo(e).forEach((r=>{n.Ll.containsKey(r)||$d(n,r)}))}function $d(n,e){n.Ml.delete(e.path.canonicalString());const t=n.Nl.get(e);t!==null&&(mc(n.remoteStore,t),n.Nl=n.Nl.remove(e),n.Bl.delete(t),vc(n))}function Hl(n,e,t){for(const r of t)r instanceof Ld?(n.Ll.addReference(r.key,e),N0(n,r)):r instanceof Md?(L(Ic,"Document no longer in limbo: "+r.key),n.Ll.removeReference(r.key,e),n.Ll.containsKey(r.key)||$d(n,r.key)):q(19791,{Wl:r})}function N0(n,e){const t=e.key,r=t.path.canonicalString();n.Nl.get(t)||n.Ml.has(r)||(L(Ic,"New document in limbo: "+t),n.Ml.add(r),vc(n))}function vc(n){for(;n.Ml.size>0&&n.Nl.size<n.maxConcurrentLimboResolutions;){const e=n.Ml.values().next().value;n.Ml.delete(e);const t=new F(ee.fromString(e)),r=n.kl.next();n.Bl.set(r,new T0(t)),n.Nl=n.Nl.insert(t,r),Rd(n.remoteStore,new bt(pt(Qi(t.path)),r,"TargetPurposeLimboResolution",Xi.Br))}}async function Ds(n,e,t){const r=H(n),s=[],i=[],a=[];r.Fl.isEmpty()||(r.Fl.forEach(((c,l)=>{a.push(r.ql(l,e,t).then((f=>{var d;if((f||t)&&r.isPrimaryClient){const m=f?!f.fromCache:(d=t==null?void 0:t.targetChanges.get(l.targetId))==null?void 0:d.current;r.sharedClientState.updateQueryState(l.targetId,m?"current":"not-current")}if(f){s.push(f);const m=dc.ka(l.targetId,f);i.push(m)}})))})),await Promise.all(a),r.Cl.gr(s),await(async function(l,f){const d=H(l);try{await d.persistence.runTransaction("notifyLocalViewChanges","readwrite",(m=>C.forEach(f,(I=>C.forEach(I.$a,(V=>d.persistence.referenceDelegate.addReference(m,I.targetId,V))).next((()=>C.forEach(I.Ua,(V=>d.persistence.referenceDelegate.removeReference(m,I.targetId,V)))))))))}catch(m){if(!dr(m))throw m;L(pc,"Failed to update sequence numbers: "+m)}for(const m of f){const I=m.targetId;if(!m.fromCache){const V=d.tu.get(I),x=V.snapshotVersion,M=V.withLastLimboFreeSnapshotVersion(x);d.tu=d.tu.insert(I,M)}}})(r.localStore,i))}async function k0(n,e){const t=H(n);if(!t.currentUser.isEqual(e)){L(Ic,"User change. New user:",e.toKey());const r=await Ad(t.localStore,e);t.currentUser=e,(function(i,a){i.Ul.forEach((c=>{c.forEach((l=>{l.reject(new D(S.CANCELLED,a))}))})),i.Ul.clear()})(t,"'waitForPendingWrites' promise is rejected due to a user change."),t.sharedClientState.handleUserChange(e,r.removedBatchIds,r.addedBatchIds),await Ds(t,r._u)}}function D0(n,e){const t=H(n),r=t.Bl.get(e);if(r&&r.Dl)return Y().add(r.key);{let s=Y();const i=t.Ol.get(e);if(!i)return s;for(const a of i??[]){const c=t.Fl.get(a);s=s.unionWith(c.view.Al)}return s}}function jd(n){const e=H(n);return e.remoteStore.remoteSyncer.applyRemoteEvent=Fd.bind(null,e),e.remoteStore.remoteSyncer.getRemoteKeysForTarget=D0.bind(null,e),e.remoteStore.remoteSyncer.rejectListen=S0.bind(null,e),e.Cl.gr=_0.bind(null,e.eventManager),e.Cl.Kl=y0.bind(null,e.eventManager),e}function O0(n){const e=H(n);return e.remoteStore.remoteSyncer.applySuccessfulWrite=C0.bind(null,e),e.remoteStore.remoteSyncer.rejectFailedWrite=x0.bind(null,e),e}class Ui{constructor(){this.kind="memory",this.synchronizeTabs=!1}async initialize(e){this.serializer=Ji(e.databaseInfo.databaseId),this.sharedClientState=this.jl(e),this.persistence=this.zl(e),await this.persistence.start(),this.localStore=this.Hl(e),this.gcScheduler=this.Jl(e,this.localStore),this.indexBackfillerScheduler=this.Yl(e,this.localStore)}Jl(e,t){return null}Yl(e,t){return null}Hl(e){return KT(this.persistence,new GT,e.initialUser,this.serializer)}zl(e){return new vd(fc.Ho,this.serializer)}jl(e){return new p0}async terminate(){var e,t;(e=this.gcScheduler)==null||e.stop(),(t=this.indexBackfillerScheduler)==null||t.stop(),this.sharedClientState.shutdown(),await this.persistence.shutdown()}}Ui.provider={build:()=>new Ui};class L0 extends Ui{constructor(e){super(),this.cacheSizeBytes=e}Jl(e,t){U(this.persistence.referenceDelegate instanceof Li,46915);const r=this.persistence.referenceDelegate.garbageCollector;return new OE(r,e.asyncQueue,t)}zl(e){const t=this.cacheSizeBytes!==void 0?Ue.withCacheSize(this.cacheSizeBytes):Ue.DEFAULT;return new vd((r=>Li.Ho(r,t)),this.serializer)}}class da{async initialize(e,t){this.localStore||(this.localStore=e.localStore,this.sharedClientState=e.sharedClientState,this.datastore=this.createDatastore(t),this.remoteStore=this.createRemoteStore(t),this.eventManager=this.createEventManager(t),this.syncEngine=this.createSyncEngine(t,!e.synchronizeTabs),this.sharedClientState.onlineStateHandler=r=>Wl(this.syncEngine,r,1),this.remoteStore.remoteSyncer.handleCredentialChange=k0.bind(null,this.syncEngine),await d0(this.remoteStore,this.syncEngine.isPrimaryClient))}createEventManager(e){return(function(){return new g0})()}createDatastore(e){const t=Ji(e.databaseInfo.databaseId),r=IE(e.databaseInfo);return PE(e.authCredentials,e.appCheckCredentials,r,t)}createRemoteStore(e){return(function(r,s,i,a,c){return new n0(r,s,i,a,c)})(this.localStore,this.datastore,e.asyncQueue,(t=>Wl(this.syncEngine,t,0)),(function(){return Cl.cn()?new Cl:new yE})())}createSyncEngine(e,t){return(function(s,i,a,c,l,f,d){const m=new I0(s,i,a,c,l,f);return d&&(m.Ql=!0),m})(this.localStore,this.remoteStore,this.eventManager,this.sharedClientState,e.initialUser,e.maxConcurrentLimboResolutions,t)}async terminate(){var e,t;await(async function(s){const i=H(s);L(Et,"RemoteStore shutting down."),i.xu.add(5),await ks(i),i.Du.shutdown(),i.Cu.set("Unknown")})(this.remoteStore),(e=this.datastore)==null||e.terminate(),(t=this.eventManager)==null||t.terminate()}}da.provider={build:()=>new da};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const cn="FirestoreClient";class M0{constructor(e,t,r,s,i){this.authCredentials=e,this.appCheckCredentials=t,this.asyncQueue=r,this._databaseInfo=s,this.user=Ce.UNAUTHENTICATED,this.clientId=Va.newId(),this.authCredentialListener=()=>Promise.resolve(),this.appCheckCredentialListener=()=>Promise.resolve(),this._uninitializedComponentsProvider=i,this.authCredentials.start(r,(async a=>{L(cn,"Received user=",a.uid),await this.authCredentialListener(a),this.user=a})),this.appCheckCredentials.start(r,(a=>(L(cn,"Received new app check token=",a),this.appCheckCredentialListener(a,this.user))))}get configuration(){return{asyncQueue:this.asyncQueue,databaseInfo:this._databaseInfo,clientId:this.clientId,authCredentials:this.authCredentials,appCheckCredentials:this.appCheckCredentials,initialUser:this.user,maxConcurrentLimboResolutions:100}}setCredentialChangeListener(e){this.authCredentialListener=e}setAppCheckTokenChangeListener(e){this.appCheckCredentialListener=e}terminate(){this.asyncQueue.enterRestrictedMode();const e=new Qt;return this.asyncQueue.enqueueAndForgetEvenWhileRestricted((async()=>{try{this._onlineComponents&&await this._onlineComponents.terminate(),this._offlineComponents&&await this._offlineComponents.terminate(),this.authCredentials.shutdown(),this.appCheckCredentials.shutdown(),e.resolve()}catch(t){const r=wc(t,"Failed to shutdown persistence");e.reject(r)}})),e.promise}}async function jo(n,e){n.asyncQueue.verifyOperationInProgress(),L(cn,"Initializing OfflineComponentProvider");const t=n.configuration;await e.initialize(t);let r=t.initialUser;n.setCredentialChangeListener((async s=>{r.isEqual(s)||(await Ad(e.localStore,s),r=s)})),e.persistence.setDatabaseDeletedListener((()=>n.terminate())),n._offlineComponents=e}async function Kl(n,e){n.asyncQueue.verifyOperationInProgress();const t=await U0(n);L(cn,"Initializing OnlineComponentProvider"),await e.initialize(t,n.configuration),n.setCredentialChangeListener((r=>$l(e.remoteStore,r))),n.setAppCheckTokenChangeListener(((r,s)=>$l(e.remoteStore,s))),n._onlineComponents=e}async function U0(n){if(!n._offlineComponents)if(n._uninitializedComponentsProvider){L(cn,"Using user provided OfflineComponentProvider");try{await jo(n,n._uninitializedComponentsProvider._offline)}catch(e){const t=e;if(!(function(s){return s.name==="FirebaseError"?s.code===S.FAILED_PRECONDITION||s.code===S.UNIMPLEMENTED:!(typeof DOMException<"u"&&s instanceof DOMException)||s.code===22||s.code===20||s.code===11})(t))throw t;it("Error using user provided cache. Falling back to memory cache: "+t),await jo(n,new Ui)}}else L(cn,"Using default OfflineComponentProvider"),await jo(n,new L0(void 0));return n._offlineComponents}async function zd(n){return n._onlineComponents||(n._uninitializedComponentsProvider?(L(cn,"Using user provided OnlineComponentProvider"),await Kl(n,n._uninitializedComponentsProvider._online)):(L(cn,"Using default OnlineComponentProvider"),await Kl(n,new da))),n._onlineComponents}function F0(n){return zd(n).then((e=>e.syncEngine))}async function pa(n){const e=await zd(n),t=e.eventManager;return t.onListen=v0.bind(null,e.syncEngine),t.onUnlisten=R0.bind(null,e.syncEngine),t.onFirstRemoteStoreListen=A0.bind(null,e.syncEngine),t.onLastRemoteStoreUnlisten=P0.bind(null,e.syncEngine),t}function B0(n,e,t,r){const s=new Nd(r),i=new Od(e,s,t);return n.asyncQueue.enqueueAndForget((async()=>kd(await pa(n),i))),()=>{s.Bu(),n.asyncQueue.enqueueAndForget((async()=>Dd(await pa(n),i)))}}function q0(n,e,t={}){const r=new Qt;return n.asyncQueue.enqueueAndForget((async()=>(function(i,a,c,l,f){const d=new Nd({next:I=>{d.Bu(),a.enqueueAndForget((()=>Dd(i,m)));const V=I.docs.has(c);!V&&I.fromCache?f.reject(new D(S.UNAVAILABLE,"Failed to get document because the client is offline.")):V&&I.fromCache&&l&&l.source==="server"?f.reject(new D(S.UNAVAILABLE,'Failed to get document from server. (However, this document does exist in the local cache. Run again without setting source to "server" to retrieve the cached document.)')):f.resolve(I)},error:I=>f.reject(I)}),m=new Od(Qi(c.path),d,{includeMetadataChanges:!0,waitForSyncWhenOnline:!0});return kd(i,m)})(await pa(n),n.asyncQueue,e,t,r))),r.promise}function $0(n,e){const t=new Qt;return n.asyncQueue.enqueueAndForget((async()=>V0(await F0(n),e,t))),t.promise}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let Gd=class{constructor(e,t,r,s,i){this._firestore=e,this._userDataWriter=t,this._key=r,this._document=s,this._converter=i}get id(){return this._key.path.lastSegment()}get ref(){return new le(this._firestore,this._converter,this._key)}exists(){return this._document!==null}data(){if(this._document){if(this._converter){const e=new j0(this._firestore,this._userDataWriter,this._key,this._document,null);return this._converter.fromFirestore(e)}return this._userDataWriter.convertValue(this._document.data.value)}}_fieldsProto(){var e;return((e=this._document)==null?void 0:e.data.clone().value.mapValue.fields)??void 0}get(e){if(this._document){const t=this._document.data.field(Cs("DocumentSnapshot.get",e));if(t!==null)return this._userDataWriter.convertValue(t)}}},j0=class extends Gd{data(){return super.data()}};/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class z0{convertValue(e,t="none"){switch(me(e)){case 0:return null;case 2:return e.booleanValue;case 3:if("mapValue"in e){if(tn(e))return this.convertToInt32Value(e.mapValue);if(et(e))return this.convertToDecimal128Value(e.mapValue)}return ue(e.integerValue||e.doubleValue);case 4:return this.convertTimestamp(e.timestampValue);case 6:return this.convertServerTimestamp(e,t);case 7:return e.stringValue;case 8:return"bytesValue"in e?this.convertBytes(Cn(e.bytesValue)):this.convertToBytesWithSubtype(e.mapValue);case 9:return this.convertReference(e.referenceValue);case 11:return this.convertGeoPoint(e.geoPointValue);case 13:return this.convertArray(e.arrayValue,t);case 15:return this.convertObject(e.mapValue,t);case 14:return this.convertVectorValue(e.mapValue);case 12:return this.convertToRegexValue(e.mapValue);case 10:return this.convertToBsonObjectId(e.mapValue);case 5:return this.convertToBsonTimestamp(e.mapValue);case 16:return vt.instance();case 1:return At.instance();default:throw q(62114,{value:e})}}convertObject(e,t){return this.convertObjectMap(e.fields,t)}convertObjectMap(e,t="none"){const r={};return xn(e,((s,i)=>{r[s]=this.convertValue(i,t)})),r}convertVectorValue(e){var r,s,i;const t=(i=(s=(r=e.fields)==null?void 0:r[es].arrayValue)==null?void 0:s.values)==null?void 0:i.map((a=>ue(a.doubleValue)));return new qe(t)}convertToBsonObjectId(e){var r,s;const t=((s=(r=e.fields)==null?void 0:r[ts])==null?void 0:s.stringValue)??"";return new qa(t)}convertToBytesWithSubtype(e){var c;const t=(c=e.fields)==null?void 0:c[Wi],r=t==null?void 0:t.bytesValue;if(!r)throw new Error("Received incorrect bytesValue for Bytes with subtype");const s=Cn(r).toUint8Array();if(s.length===0)throw new Error("Received empty bytesValue for Bytes with subtype");const i=s[0],a=s.slice(1);return new Ke(ae.fromUint8Array(a),i)}convertToBsonTimestamp(e){var i,a,c,l,f,d,m;const t=(i=e.fields)==null?void 0:i[En],r=Number((l=(c=(a=t==null?void 0:t.mapValue)==null?void 0:a.fields)==null?void 0:c[Ri])==null?void 0:l.integerValue),s=Number((m=(d=(f=t==null?void 0:t.mapValue)==null?void 0:f.fields)==null?void 0:d[Pi])==null?void 0:m.integerValue);return new $a(r,s)}convertToRegexValue(e){var s,i,a,c,l,f,d,m,I,V;const t=((l=(c=(a=(i=(s=e.fields)==null?void 0:s[Wt])==null?void 0:i.mapValue)==null?void 0:a.fields)==null?void 0:c[Ai])==null?void 0:l.stringValue)??"",r=((V=(I=(m=(d=(f=e.fields)==null?void 0:f[Wt])==null?void 0:d.mapValue)==null?void 0:m.fields)==null?void 0:I[bi])==null?void 0:V.stringValue)??"";return new Ha(t,r)}convertToInt32Value(e){var r,s;const t=Number((s=(r=e.fields)==null?void 0:r[Nn])==null?void 0:s.integerValue);return new Wa(t)}convertToDecimal128Value(e){var r,s;const t=((s=(r=e.fields)==null?void 0:r[en])==null?void 0:s.stringValue)??"";return new ja(t)}convertGeoPoint(e){return new gt(ue(e.latitude),ue(e.longitude))}convertArray(e,t){return(e.values||[]).map((r=>this.convertValue(r,t)))}convertServerTimestamp(e,t){switch(t){case"previous":const r=Rs(e);return r==null?null:this.convertValue(r,t);case"estimate":return this.convertTimestamp(tr(e));default:return null}}convertTimestamp(e){const t=Zt(e);return new te(t.seconds,t.nanos)}convertDocumentKey(e,t){const r=ee.fromString(e);U(zf(r),9688,{name:e});const s=new Xr(r.get(1),r.get(3)),i=new F(r.popFirst(5));return s.isEqual(t)||Ct(`A document reference to ${i} refers to a different database (${s.projectId}/${s.database}), which is not supported. It will be treated as a reference in the current database (${t.projectId}/${t.database}) instead.`),i}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Wd(n,e,t){let r;return r=n?n.toFirestore(e):e,r}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Ql="AsyncQueue";class Yl{constructor(e=Promise.resolve()){this._E=[],this.oE=!1,this.aE=[],this.uE=null,this.cE=!1,this.lE=!1,this.EE=[],this._r=new Qf(this,"async_queue_retry"),this.hE=()=>{const r=$o();r&&L(Ql,"Visibility state changed to "+r.visibilityState),this._r.Xn()},this.TE=e;const t=$o();t&&typeof t.addEventListener=="function"&&t.addEventListener("visibilitychange",this.hE)}get isShuttingDown(){return this.oE}enqueueAndForget(e){this.enqueue(e)}enqueueAndForgetEvenWhileRestricted(e){this.PE(),this.IE(e)}enterRestrictedMode(e){if(!this.oE){this.oE=!0,this.lE=e||!1;const t=$o();t&&typeof t.removeEventListener=="function"&&t.removeEventListener("visibilitychange",this.hE)}}enqueue(e){if(this.PE(),this.oE)return new Promise((()=>{}));const t=new Qt;return this.IE((()=>this.oE&&this.lE?Promise.resolve():(e().then(t.resolve,t.reject),t.promise))).then((()=>t.promise))}enqueueRetryable(e){this.enqueueAndForget((()=>(this._E.push(e),this.RE())))}async RE(){if(this._E.length!==0){try{await this._E[0](),this._E.shift(),this._r.reset()}catch(e){if(!dr(e))throw e;L(Ql,"Operation failed with retryable error: "+e)}this._E.length>0&&this._r.Yn((()=>this.RE()))}}IE(e){const t=this.TE.then((()=>(this.cE=!0,e().catch((r=>{throw this.uE=r,this.cE=!1,Ct("INTERNAL UNHANDLED ERROR: ",Jl(r)),r})).then((r=>(this.cE=!1,r))))));return this.TE=t,t}enqueueAfterDelay(e,t,r){this.PE(),this.EE.indexOf(e)>-1&&(t=0);const s=Ec.createAndSchedule(this,e,t,r,(i=>this.AE(i)));return this.aE.push(s),s}PE(){this.uE&&q(47125,{VE:Jl(this.uE)})}verifyOperationInProgress(){}async dE(){let e;do e=this.TE,await e;while(e!==this.TE)}fE(e){for(const t of this.aE)if(t.timerId===e)return!0;return!1}mE(e){return this.dE().then((()=>{this.aE.sort(((t,r)=>t.targetTimeMs-r.targetTimeMs));for(const t of this.aE)if(t.skipDelay(),e!=="all"&&t.timerId===e)break;return this.dE()}))}pE(e){this.EE.push(e)}AE(e){const t=this.aE.indexOf(e);this.aE.splice(t,1)}}function Jl(n){let e=n.message||"";return n.stack&&(e=n.stack.includes(n.message)?n.stack:n.message+`
`+n.stack),e}class ar extends Zi{constructor(e,t,r,s){super(e,t,r,s),this.type="firestore",this._queue=new Yl,this._persistenceKey=(s==null?void 0:s.name)||"[DEFAULT]"}async _terminate(){if(this._firestoreClient){const e=this._firestoreClient.terminate();this._queue=new Yl(e),this._firestoreClient=void 0,await e}}}function sI(n,e){const t=typeof n=="object"?n:lh(),r=typeof n=="string"?n:e||vi,s=_a(t,"firestore").getImmediate({identifier:r});if(!s._initialized){const i=Up("firestore");i&&UE(s,...i)}return s}function Ac(n){if(n._terminated)throw new D(S.FAILED_PRECONDITION,"The client has already been terminated.");return n._firestoreClient||G0(n),n._firestoreClient}function G0(n){var r,s,i,a;const e=n._freezeSettings(),t=SE(n._databaseId,((r=n._app)==null?void 0:r.options.appId)||"",n._persistenceKey,(s=n._app)==null?void 0:s.options.apiKey,e);n._componentsProvider||(i=e.localCache)!=null&&i._offlineComponentProvider&&((a=e.localCache)!=null&&a._onlineComponentProvider)&&(n._componentsProvider={_offline:e.localCache._offlineComponentProvider,_online:e.localCache._onlineComponentProvider}),n._firestoreClient=new M0(n._authCredentials,n._appCheckCredentials,n._queue,t,n._componentsProvider&&(function(l){const f=l==null?void 0:l._online.build();return{_offline:l==null?void 0:l._offline.build(f),_online:f}})(n._componentsProvider))}/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Hd extends z0{constructor(e){super(),this.firestore=e}convertBytes(e){return new Ke(e)}convertReference(e){const t=this.convertDocumentKey(e,this.firestore._databaseId);return new le(this.firestore,null,t)}}class Br{constructor(e,t){this.hasPendingWrites=e,this.fromCache=t}isEqual(e){return this.hasPendingWrites===e.hasPendingWrites&&this.fromCache===e.fromCache}}class An extends Gd{constructor(e,t,r,s,i,a){super(e,t,r,s,a),this._firestore=e,this._firestoreImpl=e,this.metadata=i}exists(){return super.exists()}data(e={}){if(this._document){if(this._converter){const t=new pi(this._firestore,this._userDataWriter,this._key,this._document,this.metadata,null);return this._converter.fromFirestore(t,e)}return this._userDataWriter.convertValue(this._document.data.value,e.serverTimestamps)}}get(e,t={}){if(this._document){const r=this._document.data.field(Cs("DocumentSnapshot.get",e));if(r!==null)return this._userDataWriter.convertValue(r,t.serverTimestamps)}}toJSON(){if(this.metadata.hasPendingWrites)throw new D(S.FAILED_PRECONDITION,"DocumentSnapshot.toJSON() attempted to serialize a document with pending writes. Await waitForPendingWrites() before invoking toJSON().");const e=this._document,t={};return t.type=An._jsonSchemaVersion,t.bundle="",t.bundleSource="DocumentSnapshot",t.bundleName=this._key.toString(),!e||!e.isValidDocument()||!e.isFoundDocument()?t:(this._userDataWriter.convertObjectMap(e.data.value.mapValue.fields,"previous"),t.bundle=(this._firestore,this.ref.path,"NOT SUPPORTED"),t)}}An._jsonSchemaVersion="firestore/documentSnapshot/1.0",An._jsonSchema={type:he("string",An._jsonSchemaVersion),bundleSource:he("string","DocumentSnapshot"),bundleName:he("string"),bundle:he("string")};class pi extends An{data(e={}){return super.data(e)}}class Yn{constructor(e,t,r,s){this._firestore=e,this._userDataWriter=t,this._snapshot=s,this.metadata=new Br(s.hasPendingWrites,s.fromCache),this.query=r}get docs(){const e=[];return this.forEach((t=>e.push(t))),e}get size(){return this._snapshot.docs.size}get empty(){return this.size===0}forEach(e,t){this._snapshot.docs.forEach((r=>{e.call(t,new pi(this._firestore,this._userDataWriter,r.key,r,new Br(this._snapshot.mutatedKeys.has(r.key),this._snapshot.fromCache),this.query.converter))}))}docChanges(e={}){const t=!!e.includeMetadataChanges;if(t&&this._snapshot.excludesMetadataChanges)throw new D(S.INVALID_ARGUMENT,"To include metadata changes with your document changes, you must also pass { includeMetadataChanges:true } to onSnapshot().");return this._cachedChanges&&this._cachedChangesIncludeMetadataChanges===t||(this._cachedChanges=(function(s,i){if(s._snapshot.oldDocs.isEmpty()){let a=0;return s._snapshot.docChanges.map((c=>{Ee(s._snapshot.query)?ca(s._snapshot.query):Ma(s.query._query);const l=new pi(s._firestore,s._userDataWriter,c.doc.key,c.doc,new Br(s._snapshot.mutatedKeys.has(c.doc.key),s._snapshot.fromCache),s.query.converter);return c.doc,{type:"added",doc:l,oldIndex:-1,newIndex:a++}}))}{let a=s._snapshot.oldDocs;return s._snapshot.docChanges.filter((c=>i||c.type!==3)).map((c=>{const l=new pi(s._firestore,s._userDataWriter,c.doc.key,c.doc,new Br(s._snapshot.mutatedKeys.has(c.doc.key),s._snapshot.fromCache),s.query.converter);let f=-1,d=-1;return c.type!==0&&(f=a.indexOf(c.doc.key),a=a.delete(c.doc.key)),c.type!==1&&(a=a.add(c.doc),d=a.indexOf(c.doc.key)),{type:W0(c.type),doc:l,oldIndex:f,newIndex:d}}))}})(this,t),this._cachedChangesIncludeMetadataChanges=t),this._cachedChanges}toJSON(){if(this.metadata.hasPendingWrites)throw new D(S.FAILED_PRECONDITION,"QuerySnapshot.toJSON() attempted to serialize a document with pending writes. Await waitForPendingWrites() before invoking toJSON().");const e={};e.type=Yn._jsonSchemaVersion,e.bundleSource="QuerySnapshot",e.bundleName=Va.newId(),this._firestore._databaseId.database,this._firestore._databaseId.projectId;const t=[],r=[],s=[];return this.docs.forEach((i=>{i._document!==null&&(t.push(i._document),r.push(this._userDataWriter.convertObjectMap(i._document.data.value.mapValue.fields,"previous")),s.push(i.ref.path))})),e.bundle=(this._firestore,this.query._query,e.bundleName,"NOT SUPPORTED"),e}}function W0(n){switch(n){case 0:return"added";case 2:case 3:return"modified";case 1:return"removed";default:return q(61501,{type:n})}}/**
 * @license
 * Copyright 2025 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */Yn._jsonSchemaVersion="firestore/querySnapshot/1.0",Yn._jsonSchema={type:he("string",Yn._jsonSchemaVersion),bundleSource:he("string","QuerySnapshot"),bundleName:he("string"),bundle:he("string")};/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function H0(n){if(n.limitType==="L"&&n.explicitOrderBy.length===0)throw new D(S.UNIMPLEMENTED,"limitToLast() queries require specifying at least one orderBy() clause")}class bc{}class Rc extends bc{}function iI(n,e,...t){let r=[];e instanceof bc&&r.push(e),r=r.concat(t),(function(i){const a=i.filter((l=>l instanceof Vc)).length,c=i.filter((l=>l instanceof Pc)).length;if(a>1||a>0&&c>0)throw new D(S.INVALID_ARGUMENT,"InvalidQuery. When using composite filters, you cannot use more than one filter at the top level. Consider nesting the multiple filters within an `and(...)` statement. For example: change `query(query, where(...), or(...))` to `query(query, and(where(...), or(...)))`.")})(r);for(const s of r)n=s._apply(n);return n}class Pc extends Rc{constructor(e,t,r){super(),this._field=e,this._op=t,this._value=r,this.type="where"}static _create(e,t,r){return new Pc(e,t,r)}_apply(e){const t=this._parse(e);return Kd(e._query,t),new un(e.firestore,e.converter,ta(e._query,t))}_parse(e){const t=Qa(e.firestore);return(function(i,a,c,l,f,d,m){let I;if((function(M,O){if(typeof M=="number"&&isNaN(M)&&O!=="=="&&O!=="!="&&O!=="array-contains")throw new Error("Invalid query. You can only perform '==' and '!=' comparisons on NaN.");if(M===null&&O!=="=="&&O!=="!="&&O!=="array-contains")throw new Error("Invalid query. You can only perform '==' and '!=' comparisons on Null.")})(m,d),f.isKeyField()){if(d==="array-contains"||d==="array-contains-any")throw new D(S.INVALID_ARGUMENT,`Invalid Query. You can't perform '${d}' queries on documentId().`);if(d==="in"||d==="not-in"){Zl(m,d);const x=[];for(const M of m)x.push(Xl(l,i,M));I={arrayValue:{values:x}}}else I=Xl(l,i,m)}else d!=="in"&&d!=="not-in"&&d!=="array-contains-any"||Zl(m,d),I=jE(c,a,m,d==="in"||d==="not-in");return de.create(f,d,I)})(e._query,"where",t,e.firestore._databaseId,this._field,this._op,this._value)}}class Vc extends bc{constructor(e,t){super(),this.type=e,this._queryConstraints=t}static _create(e,t){return new Vc(e,t)}_parse(e){const t=this._queryConstraints.map((r=>r._parse(e))).filter((r=>r.getFilters().length>0));return t.length===1?t[0]:ot.create(t,this._getOperator())}_apply(e){const t=this._parse(e);return t.getFilters().length===0?e:((function(s,i){let a=s;const c=i.getFlattenedFilters();for(const l of c)Kd(a,l),a=ta(a,l)})(e._query,t),new un(e.firestore,e.converter,ta(e._query,t)))}_getQueryConstraints(){return this._queryConstraints}_getOperator(){return this.type==="and"?"and":"or"}}class Sc extends Rc{constructor(e,t){super(),this._field=e,this._direction=t,this.type="orderBy"}static _create(e,t){return new Sc(e,t)}_apply(e){const t=(function(s,i,a){if(s.startAt!==null)throw new D(S.INVALID_ARGUMENT,"Invalid query. You must not call startAt() or startAfter() before calling orderBy().");if(s.endAt!==null)throw new D(S.INVALID_ARGUMENT,"Invalid query. You must not call endAt() or endBefore() before calling orderBy().");return new us(i,a)})(e._query,this._field,this._direction);return new un(e.firestore,e.converter,Oy(e._query,t))}}function oI(n,e="asc"){const t=e,r=Cs("orderBy",n);return Sc._create(r,t)}class Cc extends Rc{constructor(e,t,r){super(),this.type=e,this._limit=t,this._limitType=r}static _create(e,t,r){return new Cc(e,t,r)}_apply(e){return new un(e.firestore,e.converter,Ni(e._query,this._limit,this._limitType))}}function aI(n){return Cc._create("limit",n,"F")}function Xl(n,e,t){if(typeof(t=$e(t))=="string"){if(t==="")throw new D(S.INVALID_ARGUMENT,"Invalid query. When querying with documentId(), you must provide a valid document ID, but it was an empty string.");if(!Nf(e)&&t.indexOf("/")!==-1)throw new D(S.INVALID_ARGUMENT,`Invalid query. When querying a collection by documentId(), you must provide a plain document ID, but '${t}' contains a '/' character.`);const r=e.path.child(ee.fromString(t));if(!F.isDocumentKey(r))throw new D(S.INVALID_ARGUMENT,`Invalid query. When querying a collection group by documentId(), the value provided must result in a valid document path, but '${r}' is not because it has an odd number of segments (${r.length}).`);return pl(n,new F(r))}if(t instanceof le)return pl(n,t._key);throw new D(S.INVALID_ARGUMENT,`Invalid query. When querying with documentId(), you must provide a valid string or a DocumentReference, but it was: ${zi(t)}.`)}function Zl(n,e){if(!Array.isArray(n)||n.length===0)throw new D(S.INVALID_ARGUMENT,`Invalid Query. A non-empty array is required for '${e.toString()}' filters.`)}function Kd(n,e){const t=(function(s,i){for(const a of s)for(const c of a.getFlattenedFilters())if(i.indexOf(c.op)>=0)return c.op;return null})(n.filters,(function(s){switch(s){case"!=":return["!=","not-in"];case"array-contains-any":case"in":return["not-in"];case"not-in":return["array-contains-any","in","not-in","!="];default:return[]}})(e.op));if(t!==null)throw t===e.op?new D(S.INVALID_ARGUMENT,`Invalid query. You cannot use more than one '${e.op.toString()}' filter.`):new D(S.INVALID_ARGUMENT,`Invalid query. You cannot use '${e.op.toString()}' filters with '${t.toString()}' filters.`)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function eh(n){return(function(t,r){if(typeof t!="object"||t===null)return!1;const s=t;for(const i of r)if(i in s&&typeof s[i]=="function")return!0;return!1})(n,["next","error","complete"])}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function cI(n){n=Rt(n,le);const e=Rt(n.firestore,ar),t=Ac(e);return q0(t,n._key).then((r=>Yd(e,n,r)))}function uI(n,e,t){n=Rt(n,le);const r=Rt(n.firestore,ar),s=Wd(n.converter,e),i=Qa(r);return Qd(r,[ed(i,"setDoc",n._key,s,n.converter!==null,t).toMutation(n._key,dt.none())])}function lI(n,e){const t=Rt(n.firestore,ar),r=FE(n),s=Wd(n.converter,e),i=Qa(n.firestore);return Qd(t,[ed(i,"addDoc",r._key,s,n.converter!==null,{}).toMutation(r._key,dt.exists(!1))]).then((()=>r))}function hI(n,...e){var f,d,m;n=$e(n);let t={includeMetadataChanges:!1,source:"default"},r=0;typeof e[r]!="object"||eh(e[r])||(t=e[r++]);const s={includeMetadataChanges:t.includeMetadataChanges,source:t.source};if(eh(e[r])){const I=e[r];e[r]=(f=I.next)==null?void 0:f.bind(I),e[r+1]=(d=I.error)==null?void 0:d.bind(I),e[r+2]=(m=I.complete)==null?void 0:m.bind(I)}let i,a,c;if(n instanceof le)a=Rt(n.firestore,ar),c=Qi(n._key.path),i={next:I=>{e[r]&&e[r](Yd(a,n,I))},error:e[r+1],complete:e[r+2]};else{const I=Rt(n,un);a=Rt(I.firestore,ar),c=I._query;const V=new Hd(a);i={next:x=>{e[r]&&e[r](new Yn(a,V,I,x))},error:e[r+1],complete:e[r+2]},H0(n._query)}const l=Ac(a);return B0(l,c,s,i)}function Qd(n,e){const t=Ac(n);return $0(t,e)}function Yd(n,e,t){const r=t.docs.get(e._key),s=new Hd(n);return new An(n,s,e._key,r,new Br(t.hasPendingWrites,t.fromCache),e.converter)}const th="@firebase/firestore",nh="4.19.0";(function(e,t=!0){J_(cr),Jn(new Rn("firestore",((r,{instanceIdentifier:s,options:i})=>{const a=r.getProvider("app").getImmediate(),c=new ar(new pE(r.getProvider("auth-internal")),new _E(a,r.getProvider("app-check-internal")),oy(a,s),a);return i={useFetchStreams:t,...i},c._setSettings(i),c}),"PUBLIC").setMultipleInstances(!0)),Ht(th,nh,e),Ht(th,nh,"esm2020")})();export{$t as G,J0 as a,hI as b,eI as c,lI as d,Q0 as e,FE as f,sI as g,cI as h,jm as i,uI as j,Y0 as k,aI as l,oI as o,iI as q,tI as s};
