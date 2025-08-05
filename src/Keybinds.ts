export type KeyAction = (key:string) => (void | Promise<void>)

export type KeyBindsType = {
  [key:string]:(string | string[])
}

class KeyBindsCls {
  private _commandsToKeys = new Map<string, string[]>()

  constructor(keyBinds:KeyBindsType) {
    for (const command in keyBinds) {
      let keys = keyBinds[command]
      if (typeof(keys) === 'string') {
        keys = [keys]
      }

      this._commandsToKeys.set(command, keys)

    }
  }

  public getKeysFor(command:string):string[] {
    return this._commandsToKeys.get(command) ?? []
  }
}


const defaultKeyBinds:KeyBindsType = {
  'quit':            ['escape', 'C-c'],
  'togglePlayPause': ['p', 'space'],
  'nextStation':     ['.', ']', 'w'],
  'prevStation':     [',', '[', 'q'],
  'randomStation':   'r',
  'gotoStation':     ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'],
  'volumeUp':        ['=', 'a'],
  'volumeDown':      ['-', 'z'],
}


export const KeyBinds = new KeyBindsCls(defaultKeyBinds)
