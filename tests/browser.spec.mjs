import {test,expect} from '@playwright/test';
import {spawn} from 'node:child_process';
import {createRequire} from 'node:module';
import {mkdtemp,rm,mkdir} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
const require=createRequire(import.meta.url);
for(const slug of ["english"])test(slug+' Next SSR, Hono CRUD, authentication and mobile',async({browser,request})=>{
 const directory=await mkdtemp(join(tmpdir(),'academy-next-')),env={...process.env,APP_PASSWORD:'next-browser-only',DATABASE_FILE:join(directory,'app.sqlite')};
 for(const key of ['TURSO_DATABASE_URL','DATABASE_URL','READ_ONLY','PUBLIC_DEMO'])delete env[key];
 const child=spawn(process.execPath,[require.resolve('next/dist/bin/next'),'start','--hostname','127.0.0.1','--port','4320'],{cwd:process.cwd(),env,stdio:['ignore','pipe','pipe']});
 try{
  await new Promise((resolve,reject)=>{const timeout=setTimeout(()=>reject(Error('Next startup timed out')),30000);child.once('exit',code=>{clearTimeout(timeout);reject(Error('Next exited '+code));});child.stdout.on('data',chunk=>{if(String(chunk).includes('Ready in')){clearTimeout(timeout);resolve();}});});
  const base='http://127.0.0.1:4320';
  expect((await request.get(base+'/api/Student')).status()).toBe(401);
  expect((await request.get(base+'/Student')).status()).toBe(401);
  const authorization='Basic '+Buffer.from('admin:next-browser-only').toString('base64');
  const html=await request.get(base+'/Student',{headers:{authorization}});
  expect(html.status()).toBe(200);expect(await html.text()).toContain('김하늘 (샘플)');
  const context=await browser.newContext({httpCredentials:{username:'admin',password:'next-browser-only'},viewport:{width:1440,height:1000}}),page=await context.newPage(),errors=[];
  page.on('pageerror',error=>errors.push(error.message));
  await page.goto(base);await expect(page.locator('.metric')).toHaveCount(4);
  await mkdir(join(tmpdir(),'onhi-preview'),{recursive:true});await page.screenshot({path:join(tmpdir(),'onhi-preview',slug+'-desktop.png'),fullPage:true});
  const open=async name=>{await page.locator(`nav a[data-feature="${name}"]`).click();await page.getByRole('button',{name:'+ 새로 등록'}).click();await expect(page.locator('#editor')).toBeVisible();};
  const save=async()=>{await page.getByRole('button',{name:'저장하기'}).click();await expect(page.locator('#editor')).not.toBeVisible();};
  const student=async()=>{const select=page.locator('#form-fields select[name="studentId"]');await expect(select.locator('option').filter({hasText:'브라우저 학생'})).toHaveCount(1);await select.selectOption({label:'브라우저 학생'});};
  await open('Student');await page.getByLabel('이름',{exact:true}).fill('브라우저 학생');await save();await expect(page.getByRole('cell',{name:'브라우저 학생',exact:true})).toBeVisible();
  await open('Class');await page.getByLabel('수업명',{exact:true}).fill('브라우저 수업');await page.getByLabel('담당 선생님',{exact:true}).fill('김선생');await save();
  await open('Attendance');await student();await page.getByLabel('날짜',{exact:true}).fill('2026-10-08');await page.getByRole('combobox',{name:'출결',exact:true}).selectOption('present');await save();await expect(page.locator('.pill')).toHaveText('출석');
  await open('Consultation');await student();await page.getByLabel('날짜',{exact:true}).fill('2026-10-08');await page.getByLabel('상담 내용',{exact:true}).fill('Next 전환 후에도 보존되는 상담');await save();await expect(page.getByText('상담 내용 · Next 전환 후에도 보존되는 상담',{exact:true})).toBeVisible();
  if(slug==='english'){
   await open('Homework');const classes=page.locator('#form-fields select[name="classId"]');await expect(classes.locator('option').filter({hasText:'브라우저 수업'})).toHaveCount(1);await classes.selectOption({label:'브라우저 수업'});await page.getByLabel('과제',{exact:true}).fill('단어 20개');await page.getByLabel('마감일',{exact:true}).fill('2026-10-09');await save();
   await open('LevelTest');await student();await page.getByLabel('날짜',{exact:true}).fill('2026-10-08');await page.getByRole('combobox',{name:'레벨',exact:true}).selectOption('B');await save();await expect(page.getByRole('cell',{name:'B',exact:true})).toBeVisible();
  }
  await page.locator('nav a[data-feature="Student"]').click();await expect(page).toHaveURL(/\/Student$/);await page.reload();await expect(page.getByRole('cell',{name:'브라우저 학생',exact:true})).toBeVisible();
  await page.getByRole('searchbox').fill('없는 학생');await page.getByRole('button',{name:'검색',exact:true}).click();await expect(page.locator('.empty')).toBeVisible();
  await page.locator('nav a[data-feature="overview"]').click();await page.setViewportSize({width:390,height:844});await page.screenshot({path:join(tmpdir(),'onhi-preview',slug+'-mobile.png'),fullPage:true});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);expect(errors).toEqual([]);await context.close();
 }finally{if(child.exitCode===null){child.kill('SIGTERM');await new Promise(resolve=>child.once('exit',resolve));}await rm(directory,{recursive:true,force:true});}
});
