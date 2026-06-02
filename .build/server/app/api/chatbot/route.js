"use strict";(()=>{var e={};e.id=2145,e.ids=[2145],e.modules={72934:e=>{e.exports=require("next/dist/client/components/action-async-storage.external.js")},54580:e=>{e.exports=require("next/dist/client/components/request-async-storage.external.js")},45869:e=>{e.exports=require("next/dist/client/components/static-generation-async-storage.external.js")},20399:e=>{e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},30517:e=>{e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},27790:e=>{e.exports=require("assert")},78893:e=>{e.exports=require("buffer")},84770:e=>{e.exports=require("crypto")},17702:e=>{e.exports=require("events")},32615:e=>{e.exports=require("http")},35240:e=>{e.exports=require("https")},86624:e=>{e.exports=require("querystring")},17360:e=>{e.exports=require("url")},21764:e=>{e.exports=require("util")},71568:e=>{e.exports=require("zlib")},19644:(e,a,t)=>{t.r(a),t.d(a,{originalPathname:()=>w,patchFetch:()=>S,requestAsyncStorage:()=>v,routeModule:()=>y,serverHooks:()=>b,staticGenerationAsyncStorage:()=>h});var r={};t.r(r),t.d(r,{POST:()=>g,dynamic:()=>p});var o=t(49303),s=t(88716),i=t(60670),n=t(87070),c=t(75571),d=t(10191),l=t(52663);let p="force-dynamic",u=`Eres el asistente virtual y maestro tutor de Trading Academy A Otro Nivel, una plataforma educativa de trading para el mercado latinoamericano. Tu rol es ayudar a los visitantes y estudiantes a aprender de forma eficiente, guiando su formaci\xf3n con explicaciones claras, ejemplos pr\xe1cticos, ejercicios breves y preguntas de verificaci\xf3n.

Cuando sea \xfatil, sugiere un plan de estudio paso a paso y pide el nivel actual del estudiante. S\xe9 did\xe1ctico y estructurado.

**SOBRE LA ACADEMIA:**
- Trading Academy A Otro Nivel ofrece un m\xe9todo probado para que personas sin experiencia o con conocimientos previos aprendan trading de manera efectiva
- El 95% de los traders pierden dinero, pero nuestro m\xe9todo te ense\xf1a a estar en el 5% ganador
- El trading es l\xf3gica y matem\xe1ticas bien aplicada, no magia ni suerte
- Comenzamos con Trading Binario para resultados r\xe1pidos mientras construyes bases s\xf3lidas, luego avanzas a Forex

**CURSOS DISPONIBLES:**
1. Curso B\xe1sico de Trading ($99.99 USD): Fundamentos del mercado, an\xe1lisis t\xe9cnico b\xe1sico, gesti\xf3n de riesgo, introducci\xf3n a trading binario
2. Curso Intermedio ($199.99 USD): Estrategias avanzadas, patrones de velas, indicadores t\xe9cnicos, transici\xf3n a Forex
3. Curso Profesional ($499.99 USD): Trading institucional, psicolog\xeda del trader, sistemas automatizados
4. Membres\xeda VIP ($999.99 USD/a\xf1o): Acceso a TODOS los cursos + trading en vivo + comunidad VIP + mentor\xeda + 2 Bots Pro

**BOTS DE TRADING:**
- Actualmente tenemos diversos bots de trading autom\xe1tico que operan en:
  * Forex
  * Criptomonedas (24/7)
  * \xcdndices Sint\xe9ticos (24/7)
- IMPORTANTE: No tenemos bots para trading binario. En binario, enfocamos en desarrollar tus habilidades manuales.

**ACCESO A CURSOS:**
- Los cursos tienen acceso de por vida (sin l\xedmite de tiempo)
- Puedes obtener un certificado al completar cada m\xf3dulo del programa
- Garant\xeda Total de satisfacci\xf3n

**M\xc9TODOS DE PAGO:**
- Tarjeta de cr\xe9dito/d\xe9bito
- PayPal
- Transferencia bancaria
- Criptomonedas (USDT, BTC)

**IMPORTANTE:**
- El trading conlleva riesgos y no garantizamos ganancias
- Los resultados dependen del esfuerzo y disciplina del estudiante
- Ofrecemos Garant\xeda Total en todos los cursos

**COMO MAESTRO TUTOR:**
Si el estudiante est\xe1 tomando un curso espec\xedfico (menciona estar en una lecci\xf3n, m\xf3dulo o curso):
1. Pregunta en qu\xe9 curso/lecci\xf3n est\xe1 trabajando
2. Ofrece explicaciones detalladas sobre los conceptos de esa lecci\xf3n
3. Puedes mencionar que hay recursos visuales (im\xe1genes, videos) en la p\xe1gina del curso
4. Sugiere ejercicios pr\xe1cticos relacionados con el tema
5. Verifica su comprensi\xf3n con preguntas
6. Anima al estudiante a marcar las lecciones como completadas cuando las entienda

Responde siempre en espa\xf1ol de manera amable, profesional y persuasiva. Si no puedes responder algo, sugiere contactar al servicio al cliente. S\xe9 conciso pero completo.`,m=[{topic:"fundamentos de trading",keywords:["qu\xe9 es trading","mercado","mercados","bolsa","forex"]},{topic:"an\xe1lisis t\xe9cnico",keywords:["an\xe1lisis t\xe9cnico","soporte","resistencia","tendencia"]},{topic:"velas japonesas",keywords:["vela","velas","candlestick","patrones de velas"]},{topic:"indicadores",keywords:["indicador","rsi","macd","media m\xf3vil","ema","sma"]},{topic:"gesti\xf3n de riesgo",keywords:["riesgo","stop loss","take profit","gesti\xf3n","risk"]},{topic:"psicolog\xeda del trader",keywords:["psicolog\xeda","disciplina","emociones","miedo","codicia"]},{topic:"bots de trading",keywords:["bot","automatizado","automatizaci\xf3n","algoritmo"]},{topic:"planes y precios",keywords:["precio","costo","plan","membres\xeda","vip","pago"]}],x=e=>{let a="number"==typeof e?e:Number(e);return Number.isFinite(a)?Math.max(0,Math.min(a,72e5)):0},f=e=>{let a=e.toLowerCase(),t=new Set;for(let{topic:e,keywords:r}of m)r.some(e=>a.includes(e))&&t.add(e);return Array.from(t)};async function g(e){try{let{message:a,conversationHistory:t=[],sessionId:r,interactionMs:o,userAgent:s,rewriteInstruction:i,rewriteTargetIndex:p}=await e.json();if(!a)return n.NextResponse.json({error:"Mensaje requerido"},{status:400});let m=t.slice(-10),g="string"==typeof i&&i.trim().length>0&&Number.isInteger(p),y=[{role:"system",content:u},...m];if(g&&t[p]&&"assistant"===t[p].role){let e=t[p];y.push({role:"user",content:`Reescribe esta respuesta previa del asistente seg\xfan esta instrucci\xf3n: "${i}". Respuesta original: "${e.content}". Mant\xe9n el contexto de la conversaci\xf3n y responde solo con la versi\xf3n reescrita.`})}else g?y.push({role:"user",content:`Reescribe la conversaci\xf3n anterior seg\xfan esta instrucci\xf3n: "${i}". Mant\xe9n el contexto y responde de forma clara y profesional.`}):y.push({role:"user",content:a});let v="string"==typeof r&&r.trim().length>0,h=x(o),b=await (0,c.getServerSession)(d.L),w=b?.user?.id;if(v){await l._.chatSession.upsert({where:{id:r},create:{id:r,userId:w,totalInteractionMs:h,userAgent:s,attendanceDate:new Date,lastActiveAt:new Date},update:{lastActiveAt:new Date,...h>0?{totalInteractionMs:{increment:h}}:{},...w?{userId:w}:{},...s?{userAgent:s}:{}}}),await l._.chatMessage.create({data:{sessionId:r,role:"user",content:a}});let e=f(a);e.length>0&&await l._.chatTopic.createMany({data:e.map(e=>({sessionId:r,topic:e,source:"keyword"}))})}let S=await fetch("https://apps.abacus.ai/v1/chat/completions",{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${process.env.ABACUSAI_API_KEY}`},body:JSON.stringify({model:"gpt-4.1-mini",messages:y,stream:!0,max_tokens:500})});if(!S.ok)throw Error(`LLM API error: ${S.status}`);let T=new ReadableStream({async start(e){let a=S.body?.getReader(),t=new TextDecoder,o=new TextEncoder,s="",i="";try{for(;;){let{done:r,value:n}=await (a?.read()??{done:!0,value:void 0});if(r)break;let c=(s+=t.decode(n,{stream:!0})).split("\n");for(let a of(s=c.pop()||"",c))if(a.startsWith("data: ")){let t=a.slice(6);if("[DONE]"===t){e.enqueue(o.encode("data: [DONE]\n\n"));return}try{let a=JSON.parse(t),r=a.choices?.[0]?.delta?.content||"";r&&(i+=r,e.enqueue(o.encode(`data: ${JSON.stringify({content:r})}

`)))}catch(e){}}}if(v&&i.trim().length>0){await l._.chatMessage.create({data:{sessionId:r,role:"assistant",content:i}});let e=f(i);e.length>0&&await l._.chatTopic.createMany({data:e.map(e=>({sessionId:r,topic:e,source:"assistant"}))})}}catch(a){console.error("Stream error:",a),e.error(a)}finally{e.close()}}});return new Response(T,{headers:{"Content-Type":"text/event-stream","Cache-Control":"no-cache",Connection:"keep-alive"}})}catch(e){return console.error("Chatbot error:",e),n.NextResponse.json({error:"Error al procesar tu mensaje. Intenta nuevamente."},{status:500})}}let y=new o.AppRouteRouteModule({definition:{kind:s.x.APP_ROUTE,page:"/api/chatbot/route",pathname:"/api/chatbot",filename:"route",bundlePath:"app/api/chatbot/route"},resolvedPagePath:"/home/ubuntu/academy/Base de datos Academy/trading_academy CJ/trading_academy/nextjs_space/app/api/chatbot/route.ts",nextConfigOutput:"",userland:r}),{requestAsyncStorage:v,staticGenerationAsyncStorage:h,serverHooks:b}=y,w="/api/chatbot/route";function S(){return(0,i.patchFetch)({serverHooks:b,staticGenerationAsyncStorage:h})}},10191:(e,a,t)=>{t.d(a,{L:()=>n});var r=t(53797),o=t(52663),s=t(42023),i=t.n(s);let n={providers:[(0,r.Z)({name:"credentials",credentials:{email:{label:"Email",type:"email"},password:{label:"Password",type:"password"}},async authorize(e){if(!e?.email||!e?.password)throw Error("Credenciales inv\xe1lidas");let a=await o._.user.findUnique({where:{email:e.email}});if(!a)throw Error("Usuario no encontrado");if(!a.emailVerified)throw Error("Por favor verifica tu email antes de iniciar sesi\xf3n");if(!await i().compare(e.password,a.password))throw Error("Contrase\xf1a incorrecta");return{id:a.id,email:a.email,name:`${a.firstName} ${a.lastName}`,role:a.role}}})],session:{strategy:"jwt"},callbacks:{jwt:async({token:e,user:a})=>(a&&(e.id=a.id,e.role=a.role),e),session:async({session:e,token:a})=>(e.user&&(e.user.id=a.id,e.user.role=a.role),e)},pages:{signIn:"/login"},secret:process.env.NEXTAUTH_SECRET}},52663:(e,a,t)=>{t.d(a,{_:()=>o});let r=require("@prisma/client"),o=globalThis.prisma??new r.PrismaClient}};var a=require("../../../webpack-runtime.js");a.C(e);var t=e=>a(a.s=e),r=a.X(0,[9276,2776,1790,5972],()=>t(19644));module.exports=r})();