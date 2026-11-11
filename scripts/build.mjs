import { access, cp, mkdir, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

// Copy only public site files; never publish the fundraiser or repository docs.
const root = fileURLToPath(new URL('../', import.meta.url));
const output = join(root, 'dist');
const inputs = ['index.html', '.nojekyll', 'assets'];

try {
  for (const input of inputs) await access(join(root, input));
  await rm(output, { recursive: true, force: true });
  await mkdir(output, { recursive: true });
  for (const input of inputs) {
    await cp(join(root, input), join(output, input), { recursive: true });
  }
  console.log('Built Saddle Brook Music coming-soon website in dist/.');
} catch (error) {
  console.error('Static site build failed:', error.message);
  process.exitCode = 1;
}
