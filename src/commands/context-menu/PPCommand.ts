import { ApplicationCommandType } from 'discord.js';
import { ContextMenuCommandBuilder, ContextMenuCommandModule, type ContextMenuCommand } from 'reciple';

export class PPCommand extends ContextMenuCommandModule {
    public data = new ContextMenuCommandBuilder()
        .setName('PP Size')
        .setType(ApplicationCommandType.User)
        .toJSON();

    public async execute({ interaction }: ContextMenuCommand.ExecuteData): Promise<void> {
        if (!interaction.isUserContextMenuCommand()) return;

        const user = interaction.targetUser ?? interaction.user;
        const ppSize = Math.floor(Math.random() * 10) + 1;

        await interaction.reply(`-# ${user}'s pp size is ${ppSize} inches!\n> ## 8${'='.repeat(ppSize)}D`);
    }
}

export default new PPCommand();