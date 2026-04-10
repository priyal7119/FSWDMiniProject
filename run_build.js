import { execSync } from 'child_process';
import { writeFileSync } from 'fs';
try {
  execSync('npm run build', { stdio: 'pipe' });
  console.log("Success");
} catch (e) {
  writeFileSync('build_clean.txt', e.stdout.toString() + "\n---STDERR---\n" + e.stderr.toString());
  console.log("Wrote to build_clean.txt");
}
