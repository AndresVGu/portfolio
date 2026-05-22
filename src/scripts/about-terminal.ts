/**
 * about-terminal.ts
 * Interactive terminal widget for the About bento cell.
 */

const COMMANDS: Record<string, () => string> = {
  help: () =>
    `  <span class="text-yellow-400 font-bold">Available commands:</span>
  <span class="text-purple-400">whoami</span>   → who I am
  <span class="text-purple-400">role</span>     → current role & company
  <span class="text-purple-400">stack</span>    → tech stack
  <span class="text-purple-400">contact</span>  → how to reach me
  <span class="text-purple-400">clear</span>    → clear the terminal`,

  whoami: () =>
    `<span class="font-bold text-gray-900 dark:text-white">Andrés Villarreal</span> — Full-Stack Developer\n  Trilingual: EN · FR · ES  |  Based in Toronto 🇨🇦`,

  role: () =>
    `<span class="text-green-400">Full-Stack Engineer</span> @ <span class="text-yellow-400">Rugged Books</span>\n  Building a custom ERP from scratch · Java · Spring Boot · React`,

  stack: () =>
    `<span class="text-cyan-400">Backend :</span>  Java · Spring Boot · .NET · C#\n  <span class="text-cyan-400">Frontend:</span>  React · TypeScript · Tailwind CSS\n  <span class="text-cyan-400">Cloud   :</span>  Azure · PostgreSQL · REST APIs\n  <span class="text-cyan-400">Other   :</span>  Linux · Git · DevOps`,

  contact: () =>
    `<span class="text-blue-400">Email  :</span>  andresvillarrealguti@gmail.com\n  <span class="text-blue-400">GitHub :</span>  github.com/AndresVGu\n  <span class="text-blue-400">LinkedIn:</span> linkedin.com/in/andres-villarreal-dev`,
};

function escHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

export function initTerminal(): void {
  const termContainer = document.getElementById('terminal-container');
  const termBody      = document.getElementById('terminal-body');
  const termHistory   = document.getElementById('terminal-history');
  const termDisplay   = document.getElementById('terminal-display');
  const termInput     = document.getElementById('terminal-input') as HTMLInputElement | null;

  if (!termContainer || !termBody || !termHistory || !termDisplay || !termInput) return;

  const cmdHistory: string[] = [];
  let histIdx = -1;

  function scrollBottom() {
    termBody!.scrollTop = termBody!.scrollHeight;
  }

  function appendInfo(html: string) {
    const div = document.createElement('div');
    div.className = 't-info';
    div.innerHTML = html;
    termHistory!.appendChild(div);
    scrollBottom();
  }

  function appendLine(prompt: string, cmd: string, output: string, isErr = false) {
    const cmdDiv = document.createElement('div');
    cmdDiv.className = 't-line';
    cmdDiv.innerHTML = `<span class="t-prompt">${prompt}</span><span class="t-cmd">${escHtml(cmd)}</span>`;
    termHistory!.appendChild(cmdDiv);

    if (output) {
      const outDiv = document.createElement('div');
      outDiv.className = isErr ? 't-err' : 't-out';
      outDiv.innerHTML = output;
      termHistory!.appendChild(outDiv);
    }
    scrollBottom();
  }

  function printWelcome() {
    appendInfo(
      `<span class="text-yellow-400 font-bold">Welcome!</span> Type a command and press <span class="font-bold text-gray-900 dark:text-white">Enter</span>.\n  Type <span class="text-purple-400">help</span> to see available commands.`
    );
  }

  termInput.addEventListener('input', () => {
    termDisplay!.textContent = termInput.value;
  });

  termInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const raw = termInput.value.trim().toLowerCase();
      termInput.value = '';
      termDisplay!.textContent = '';
      histIdx = -1;
      if (!raw) return;

      cmdHistory.unshift(raw);

      if (raw === 'clear') {
        termHistory!.innerHTML = '';
        return;
      }

      const fn = COMMANDS[raw];
      if (fn) {
        appendLine('$ ', raw, fn());
      } else {
        appendLine(
          '$ ', raw,
          `command not found: <span class="font-bold text-gray-900 dark:text-white">${escHtml(raw)}</span> — try <span class="text-purple-400">help</span>`,
          true
        );
      }
    }

    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (histIdx < cmdHistory.length - 1) histIdx++;
      termInput.value = cmdHistory[histIdx] ?? '';
      termDisplay!.textContent = termInput.value;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (histIdx > 0) histIdx--;
      else { histIdx = -1; termInput.value = ''; }
      termDisplay!.textContent = termInput.value;
    }
  });

  termContainer.addEventListener('click', () => termInput.focus({ preventScroll: true }));

  printWelcome();
  setTimeout(() => termInput.focus({ preventScroll: true }), 100);
}
