import { Command } from 'discord-akairo';
import { Message } from 'discord.js';

interface LMGTFYCommandArgs {
  query: string;
}

class LMGTFYCommand extends Command {
  constructor() {
    super('lmgtfy', {
      aliases: [ 'lmgtfy' ],
      description: 'Generate a "Let Me Google That For You" link.',
      args: [
        {
          id: 'query',
          match: 'content',
          prompt: {
            start: 'Please provide a search query.'
          }
        }
      ]
    });
  }

  exec(message: Message, { query }: LMGTFYCommandArgs) {
    query = encodeURIComponent(query);
    return message.channel.send(`https://lmgtfy.com/?q=${query}`);
  }
}

export default LMGTFYCommand;
