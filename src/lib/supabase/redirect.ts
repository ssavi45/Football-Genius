export function safeAuthReturnPath(value:string|null,origin:string) {
  if(!value||!value.startsWith('/')||value.startsWith('//')||/[\\\r\n]/.test(value))return '/profile';
  try{const target=new URL(value,origin);return target.origin===new URL(origin).origin?target.pathname+target.search+target.hash:'/profile';}
  catch{return '/profile';}
}
