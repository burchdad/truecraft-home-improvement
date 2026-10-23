import {initBotId} from 'botid/client/core';
initBotId({protect:[{path:'/api/email-estimate',method:'POST'}]});
