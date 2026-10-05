import { SlashCommandBuilder, SlashCommandModule, type SlashCommand } from 'reciple';
import { RockPaperScissors } from '../+games/RockPaperScissors.js';
import { MessageFlags } from 'discord.js';

export class RPSCommand extends SlashCommandModule {
    public data = new SlashCommandBuilder()
        .setName('rps')
        .setDescription('Play Rock Paper Scissors with another user')
        .addUserOption(option => option
            .setName('user')
            .setDescription('The user to play against')
        )
        .toJSON();

    public async execute({ interaction }: SlashCommand.ExecuteData): Promise<void> {
        if (!interaction.isChatInputCommand()) return;

        const user = interaction.user;
        const enemy = interaction.options.getUser('user');

        if (user.id === enemy?.id) {
            await interaction.reply({
                flags: [MessageFlags.Ephemeral],
                content: 'You cannot play against yourself!'
            });
            return;
        }

        const game = new RockPaperScissors({
            user,
            enemy: enemy ?? undefined,
            timeout: 30000
        });

        await game.play(interaction);
    }
}

export default new RPSCommand();