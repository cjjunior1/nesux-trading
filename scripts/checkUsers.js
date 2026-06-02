#!/usr/bin/env node
const {PrismaClient} = require('@prisma/client');

(async ()=>{
  const p = new PrismaClient();
  try {
    const count = await p.user.count();
    console.log(`USERS_COUNT:${count}`);
    const users = await p.user.findMany({take:5});
    console.log('USERS_SAMPLE:', JSON.stringify(users, null, 2));
  } catch(e) {
    console.error('ERROR:', e);
    process.exitCode = 1;
  } finally {
    await p.$disconnect();
  }
})();
