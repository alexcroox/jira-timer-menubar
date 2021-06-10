# JIRA Timer Menubar

macOS and Linux menubar app for JIRA time logging. Built with React and Electron

<img src="/static/demo.gif?raw=true">

## Install

Head over to the [releases to download](https://github.com/alexcroox/jira-timer-menubar/releases/latest) for macOS or Linux.

You will need to use an [API Token](https://id.atlassian.com/manage-profile/security/api-tokens) as the password for your Atlassian to login. [This guide will help you generate one.](https://support.atlassian.com/atlassian-account/docs/manage-api-tokens-for-your-atlassian-account/)

#### Linux users

If you are running newer versions of GNOME you will need the 
[TopIcons Extension](https://extensions.gnome.org/extension/495/topicons/)
otherwise no icon will appear in your tray, and no window can be opened.

## Chrome Extension

Install the [Chrome extension](https://github.com/alexcroox/jira-timer-menubar-chrome-extension) to quickly start a timer from the JIRA web ui.

## Local development

#### Install dependencies

The main process lives inside `/main` and the renderer process inside `/renderer`. https://electronjs.org/docs/tutorial/application-architecture

```bash
$ npm install
```

#### Launch dev environment

```bash
$ npm run dev
```

#### Build for release testing

```bash
$ npm run build
```
