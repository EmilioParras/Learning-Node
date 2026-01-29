import os from 'node:os';
import ms from 'ms';

const systeamData = {
    platform: os.platform(),
    cpuCores: os.cpus(),
    totalMemory: os.totalmem(),
    freeMemory: os.freemem(),
    timeActive: ms((os.uptime() * 1000), { long: true}),
}

console.log(systeamData);   