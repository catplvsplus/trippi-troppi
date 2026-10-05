import { SlashCommandBuilder, SlashCommandModule, type SlashCommand } from 'reciple';

export class PPCommand extends SlashCommandModule {
    public data = new SlashCommandBuilder()
        .setName('pp')
        .setDescription('Get the pp size of a user')
        .addUserOption(user => user
            .setName('user')
            .setDescription('The user to get the pp size of')
        ).toJSON();

    public async execute({ interaction }: SlashCommand.ExecuteData): Promise<void> {
        const user = interaction.options.getUser('user') ?? interaction.user;
        const ppSize = Math.floor(Math.random() * 10) + 1;

        await interaction.reply(`-# ${user}'s pp size is ${ppSize} inches!\n## 8${'='.repeat(ppSize)}D`);
    }
}

export default new PPCommand();