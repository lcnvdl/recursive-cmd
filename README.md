# recursive-cmd
Executes a command recursively

```bash
npm i recursive-cmd -g
```

# Usage
Execute a "npm i" command in each folder recursively (ignoring node_modules folders).
```bash
recursive --ignore node_modules -- npm i
```

Print the directories recursively
```bash
recursive -- echo Current dir is [dir]
```
