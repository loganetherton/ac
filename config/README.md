### Git Workflow

This document details the workflow that developers should follow in regards to pulling and committing changes to the codebase.

#### Software

This explanation uses Git Bash, a Git GUI that comes standard with the official Git SCM package. Git Bash refers to the version of Git that works with the [Bourne Again Shell](http://en.wikipedia.org/wiki/Bash_%28Unix_shell%29). You can download Git Bash [here](http://git-scm.com/downloads).

#### Version Control Strategy

A high-level explanation of the version control strategy most small teams follow can be found [here](http://stackoverflow.com/a/2429011/2216056).

#### Cloning and Branching

To create a local development copy of the Appraisal Scope platform, you must [clone](http://git-scm.com/docs/git-clone) both the [front-end](https://github.com/ascope/front-end) and [back-end](https://github.com/ascope/back-end) Appraisal Scope repositories.

Create a directory to hold the source code of both the front-end and back-end code. Change to this directory, and type the following commands in Git Bash:

    git clone git@github.com:ascope/front-end.git
    git clone git@github.com:ascope/back-end.git

Currently, the `development` branch is considered to be [stable](https://github.com/ascope/manuals/blob/master/Developer's%20Guide/Guidelines/Overview/Glossary.md), even though it is not ready for [production](https://github.com/ascope/manuals/blob/master/Developer's%20Guide/Guidelines/Overview/Glossary.md). All development should be done on separate development branches, for which the users should submit [pull requests](https://help.github.com/articles/using-pull-requests/) to submit the code for consideration in the development branch. Once the `development` branch is considered to be ready for production, it will be merged with the `master` branch.

To check out the `development` branch, enter the following command:

```bash
git checkout -b development origin/development
```
    
This same command can be used to create new branches for development of a specific feature or bug. For example, if a developer were addressing login problems, and wanted to checkout a new branch called `login_debug`, they could run:

```bash
git checkout -b login_debug
```

#### Updating Your Local Copy

As other developers push to the remote repository, your local copy of the codebase will quickly become outdated. Keeping your local copy up to date can be a painless process if a few simple steps are followed. In most cases, simply running the following will bring your local copy up to date. Assuming you are still on the `login_debug` branch, enter the following:

```bash
git stash
git fetch origin
git rebase origin/login_debug
git stash pop
```

_Note: If you are using PhpStorm as your IDE, you can select `Update Project` from the `VCS` menu, and select `Rebase` under `Update Type` and `Stash` under `Clean working tree before update`. This will follow the steps described above._

**Details**

1. Commit as much code as you can, as noted in the _Committing Code_ section.
2. [Unstage](http://git-scm.com/docs/git-add) all staged files by running:

    ```bash
    git reset
    ```

3. A [stash](http://git-scm.com/book/en/v1/Git-Tools-Stashing) will temporarily save all of your local changes without committing them. From the console (make sure you are in the correct folder before continuing) use the following command:

    ```bash
    git stash
    ```

4. Ensure that you do not have any uncommitted or unstashed changes by entering:

    ```bash
    git diff
    ```

5. Any unstashed changed to staged files will be shown in the output. You are now safe to retrieve content from the remote repository by entering:

    ```bash
    git fetch origin
    ```

6. Once you have all changes from the remote repository, you are going to apply your local commits that have not been pushed yet to the front of the commits you just pulled from the remote repository. This will help create a coherent story for anyone browsing the Git log. This is done via `rebase`, as opposed to `merge`, by entering:

    ```bash
    git rebase origin/login_debug
    ```

    Generally, you will not encounter any conflicts during this process. If you do, please refer to _Resolving Conflicts_ below.
    A rebase happens in three steps:
    
    1. All local commits that have not yet been pushed are stashed.
    2. Changes from the remote repository are applied to your local copy of the codebase.
    3. Your uncommitted local changes are then applied on top of the code that was just retrieved from the repository.

7. Once all remote changes have been applied to your local copy, you can retrieve your local changes which were previous stashed by entering:

    ```bash
    git stash apply
    ```

8. Generally, you will not encounter any conflicts when unstashing changes. If you do, please refer to _Resolving Conflicts_ below. If there are no conflicts, you are now safe to continue work as normal.

If this process seems overwhelming, don't worry - it's actually much easier than it sounds! If you need help, please don't hesitate to ask one of the developers in the _V2 Team_ room.

#### Committing Code

A successful git strategy will include a few key ingredients:
  
1. Commit your code often! Do not necessarily wait until the code is "perfect" to commit it. Committing early and often is the key to developing a working log of your development cycle.
2. Make sure that the code is working. The fact is that no code is perfect. Bugs exist. It's a fact of development. But the goal here it is minimize bugs entering any stable branch. But do not let the fear of undiscovered bugs prevent you from making progress. Sanity check your code for errors. When working on the front-end, check that your code did not create any new JsHint errors. Run all tests to make sure that they still all pass.
3. Write tests for your code! If exists tests stop working because of your code, fix your code, not the tests (unless the tests truly are what is broken). Information on front-end tests can be found [here](https://github.com/ascope/manuals/blob/master/Developer's%20Guide/Guidelines/Back-end/Running%20tests%20and%20building.md). Information on back-end tests can be found [here](https://github.com/ascope/manuals/blob/master/Developer's%20Guide/Guidelines/Front-end/Running%20tests%20and%20building.md).
4. Don't commit any local configuration changes that are specific to your working environment. Remember that code that you commit will be applied for everyone.
5. Don't commit commented out code. Rely on the [Git log](http://git-scm.com/docs/git-log) to review code history.

#### Commit Messages

Commit messages are an extremely important part of the Git workflow, as it provides one of the most useful records of the development cycle the code has undergone. Descriptive commit messages provide an extremely easy way to search for code changes. An explanation of searching through commit messages can be found [here](http://stackoverflow.com/questions/3826748/git-how-to-search-for-through-commit-messages-using-command-line).

Commit messages for the Appraisal Scope platform should be prefixed with the [Pivotal Tracker](https://www.pivotaltracker.com) story number that the commit pertains to, followed by a short description of the changes. These two items should be written on the same line. Leave one empty line beneath the story number, and underneath that, write an extended explanation of changes. For example:

    #12345678 Git Workflow documentation updates
    
    This should (hopefully) finally solve any Git issues we are having these days.
    No more lost commits!

#### Pushing Changes to the Remote Repository

Before pushing changes to the remote repository, ensure that your local development version is up to date by following the instructions above.

Once your local copy has been updated, commit your changes. You are now ready to push your code to the repository. Assuming you are still on the `login_debug` branch, you would enter the following command:

```bash
git push origin login_debug
```

If the remote branch `login_debug` does not yet exist, this will create it. Once your branch is pushed to the remote repository, you can then initiate a pull request.

**Do not ever force a push using the `-f` flag! If your `push` fails, you must fix the problems in your local branch. Pushing with `-f` overwrites the remote copy of the repository, which could have disastrous effects.**

#### Pull Requests



#### Resolving conflicts

Should you ever enter conflicts when pulling code from the remote repository, you can resolve them using the process described below.

**Finding Files With Conflicts (Command Line)**

To view files with conflicts using the command line, enter:

```bash
git diff --name-only --diff-filter=U
```

**Finding Files With Conflicts (GUI)**

Open the Git GUI and press the "rescan" button. In the unstage section in the top left, there will be a list of files with conflicts. 

**Resolving Conflicts**

For each conflicting file, you can follow the procedure described below to resolve conflicts:

1. Open the conflicting file.
2. Find the block of code between `<<<<<<<` and `>>>>>>`. These symbols are used to indicate git conflicts. Any piece of code between `<<<<<<<` and `========` is conflicting code that was pulled from the remote repository. Any piece of code between `=======` and `>>>>>>>>` is conflicting code from your local changes. You can resolve the conflict one of three ways:
  1. If you understand the code in question, edit the file to restore the correct code. Leave only the code that you want in your copy of the file.
  2. If you don't understand the code, ask the last developer who changed that bit of code for help. Once you understand the code, edit it so that only the desired code appears in the file.
  3. If you are unable to determine the correct code to leave in the file, **remove your local changes** (the second part), leaving only the first part.
    1.There can be more then one block of conflict code in a file. Use the same rules for each one.
3. Search for unmerged files again using one of the methods described above. If you have followed the directions correctly, all conflicts should be removed. At this point, no files contain `<<<<<<<<`, `========` or `>>>>>>>`. 
4. You can now restage any files which have been unstaged by running:

    ```bash
    git add .
    ```
    
5. After you are done resolving conflicts in all files, you should do one of the following:
  1. If the conflict appeared while running `git rebase`, continue with the rebase process by running:
  
    ```bash
    git rebase --continue
    ```
    
  2. If you got a conflict while running `git stash apply`, you should now unstage all of the previously conflicting files. This will reset the file status and will allow you to continue working on any uncommited code you had before starting the update process. You can unstage files by running:
  
    ```bash
    git reset
    ```

### Notes
When pulling code from the remote repository, it is generally a good idea to run the following sequence of commands. 

From the backend/ directory of the Appraisal Scope project, run:

```
composer dump-autoload -o && php artisan dump-autoload
```
This will recreate the autoload files for both Composer and Laravel.

From the frontend/ directory, run the following:
```
bower install && npm install
```
This will update all bower dependencies, to keep the package management in sync.