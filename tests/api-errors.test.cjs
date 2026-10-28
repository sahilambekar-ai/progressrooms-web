const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path'),ts=require('typescript');
const {outputText}=ts.transpileModule(fs.readFileSync(path.join(__dirname,'../src/lib/api-errors.ts'),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}});
const context={exports:{}};vm.runInNewContext(outputText,context);
const message=context.exports.apiErrorMessage;
test('FastAPI field errors produce readable text without exposing submitted values',()=>{
 assert.equal(message({detail:[{loc:['body','pricing','price'],msg:'Input should be greater than or equal to 0',input:'private-input'}]},'fallback'),'pricing.price: Input should be greater than or equal to 0');
});
test('String errors, malformed errors and unknown errors keep useful fallbacks',()=>{
 assert.equal(message({detail:'Class is full'},'fallback'),'Class is full');
 for(const value of [null,{}, {detail:[null,{}]}, {detail:42}])assert.equal(message(value,'Try again'),'Try again');
});
