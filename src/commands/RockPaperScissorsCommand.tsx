import { ApplicationCommandType, MessageFlags } from 'discord.js';
import { ContextMenuCommandBuilder, ContextMenuCommandModule, type ContextMenuCommand } from 'reciple';
import { RockPaperScissors } from '../+games/RockPaperScissors.js';

export class RockPaperScissorsCommand extends ContextMenuCommandModule {
    public data = new ContextMenuCommandBuilder()
        .setName('Rock Paper Scissors')
        .setType(ApplicationCommandType.User)
        .toJSON();

    public async execute({ interaction }: ContextMenuCommand.ExecuteData): Promise<void> {
        if (!interaction.isUserContextMenuCommand()) return;

        const user = interaction.user;
        const enemy = interaction.targetUser;

        if (user.id === enemy.id) {
            await interaction.reply({
                flags: [MessageFlags.Ephemeral],
                content: 'You cannot play against yourself!'
            });
            return;
        }

        const game = new RockPaperScissors({
            user,
            enemy,
            timeout: 30000
        });

        await game.play(interaction);
    }
}

export default new RockPaperScissorsCommand();