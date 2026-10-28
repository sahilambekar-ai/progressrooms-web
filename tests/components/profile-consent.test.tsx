import { render,screen,waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {expect,it,vi} from 'vitest';
import {StudentDetails} from '../../src/components/StudentDetails';
it('includes the explicit consent attestation and reference when saving personal changes',async()=>{
 const requests:RequestInit[]=[];const saved=vi.fn();
 vi.stubGlobal('fetch',vi.fn(async(_url:string,options?:RequestInit)=>{if(options?.method==='PATCH')requests.push(options);return new Response(JSON.stringify(options?.method==='PATCH'?{message:'Saved'}:[]),{status:200});}));
 render(<StudentDetails student={{id:'student-1',student_record_id:'record-1',name:'Learner',email:'learner@example.test',phone:'+919876543210',status:'ACTIVE',is_verified:true,attended:0,total:0}} onSaved={saved} onClose={()=>{}} />);
 const user=userEvent.setup();await user.clear(screen.getByLabelText('Full name *'));await user.type(screen.getByLabelText('Full name *'),'Corrected learner');
 await user.click(screen.getByRole('checkbox'));await user.type(screen.getByLabelText(/Consent reference/),'REQUEST-123');await user.click(screen.getByRole('button',{name:'Save changes'}));
 await waitFor(()=>expect(saved).toHaveBeenCalledOnce());expect(JSON.parse(requests[0].body as string)).toMatchObject({full_name:'Corrected learner',profile_consent_confirmed:true,profile_consent_reference:'REQUEST-123'});
});
