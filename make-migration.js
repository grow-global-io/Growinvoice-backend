// import { exec } from 'child_process';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { exec } = require('child_process');

const args = process.argv.slice(2);
const nameArg = args.find((arg) => arg.startsWith('--name='));
const migrationName = nameArg ? nameArg.split('=')[1] : 'default';

const commands = [
  'zenstack format',
  'yarn run generate',
  'npx prisma format',
  'npx prisma generate',
  `npx prisma migrate dev --name ${migrationName}`,
];

commands.forEach((cmd) => {
  exec(cmd, (err, stdout) => {
    if (err) {
      console.error(err);
      return;
    }
    console.log(stdout);
  });
});
