import test from "node:test";
import assert from "node:assert/strict";
import {stat} from "node:fs/promises";
import {asIsPostCategories,asIsPostItems} from "./post-instance-data.js";
import {postsForAsIsCategory} from "./post-list.js";

test("live Figma snapshot retains all six categories and 433 unique instance IDs",()=>{
 assert.deepEqual(asIsPostCategories.map(c=>[c.name,c.count]),[["사용팁",10],["대출",237],["신용점수",15],["금융사고",5],["부동산",47],["생활",119]]);
 assert.equal(asIsPostItems.length,433);
 assert.equal(new Set(asIsPostItems.map(p=>p.id)).size,433);
 assert.equal(new Set(asIsPostItems.map(p=>p.nodeId)).size,433);
 assert.equal(postsForAsIsCategory("보험").length,0);
});
test("category results follow numeric source IDs without personalization or mixing",()=>{
 const before=JSON.stringify(asIsPostItems);
 for(const [name,prefix,count] of [["사용팁","T",10],["대출","L",237],["신용점수","C",15],["금융사고","A",5],["부동산","R",47],["생활","D",119]]){
  const posts=postsForAsIsCategory(name);
  assert.equal(posts.length,count);
  assert.ok(posts.every((p,i)=>p.category===name&&p.id.startsWith(prefix+"-")&&Number(p.id.split("-")[1])===i+1));
 }
 assert.equal(JSON.stringify(asIsPostItems),before);
 assert.equal(postsForAsIsCategory("사용팁")[0].title,"[팩트체크] 대출조회만 해도\n신용점수가 떨어질까?");
});
test("all 84 source images are local, nonempty, and have supported original crops",async()=>{
 const images=new Set();
 for(const post of asIsPostItems){
  assert.ok(post.title.trim());
  assert.match(post.thumbnail.src,/^assets\/post-instance-[\da-f]+-[\w.-]+\.png$/);
  images.add(post.thumbnail.src);
  const {width,height,transform:m}=post.thumbnail;
  assert.equal(width,88);assert.equal(height,62);
  assert.equal(m[0][1],0);assert.equal(m[1][0],0);assert.ok(m[0][0]>0&&m[1][1]>0);
 }
 assert.equal(images.size,84);
 for(const src of images)assert.ok((await stat(new URL(src,import.meta.url))).size>0,src);
});
