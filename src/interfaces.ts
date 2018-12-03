'use strict';

// Only add simple interfaces here. No import's allowed

// Only add simple interfaces here. No import's allowed
// Only add simple interfaces here. No import's allowed
// Only add simple interfaces here. No import's allowed
// Only add simple interfaces here. No import's allowed
// Only add simple interfaces here. No import's allowed
// Only add simple interfaces here. No import's allowed
// Only add simple interfaces here. No import's allowed
export enum ConnectionStatus {
  NotStarted,
  Starting,
  RunningLoading,
  RunningLoaded,
  Stopping,
  Failed,
  Stopped,
  Initializing,
  InitializationComplete
}

export enum ConnectionType {
  Unknown,
  Local,
  Remote
}

export enum ProtocolType {
  UNKNOWN = '<unknown>',
  STDIO = 'stdio',
  TCP = 'tcp',
}

export interface IConnectionConfiguration {
  type: ConnectionType;
  protocol: ProtocolType;
  host: string;
  port: number;
  timeout: number;
  enableFileCache: boolean;
  debugFilePath: string;
  puppetBaseDir: string;
  languageServerPath: string;
  rubydir: string;
  rubylib: string;
  environmentPath: string;
  sslCertFile: string;
  sslCertDir: string;
  languageServerCommandLine: Array<string>;

  puppetInstallType:PuppetInstallType; 
  pdkBinDir:string;
  pdkRubyLib:string;
  pdkRubyVerDir:string;
  pdkGemDir:string;
  pdkRubyDir:string;
  pdkRubyBinDir:string;
  pdkGemVerDir:string; 
}

export enum PuppetInstallType{
  PDK    = "pdk",
  PUPPET = "agent",
}
