import { ContextMenuCommandBuilder, ContextMenuCommandModule, type ContextMenuCommand } from 'reciple';
import { ApplicationCommandType, MessageFlags } from 'discord.js';
import { convert } from 'owospeak';

export class OwOCommand extends ContextMenuCommandModule {
    public data = new ContextMenuCommandBuilder()
        .setName('UwUify')
        .setType(ApplicationCommandType.Message)
        .toJSON();

    public async execute({ interaction }: ContextMenuCommand.ExecuteData): Promise<void> {
        if (!interaction.isMessageContextMenuCommand()) return;

        if (!interaction.targetMessage.content) {
            await interaction.reply({
                flags: [MessageFlags.Ephemeral],
                content: 'The selected message does not contain any text to UwUify.'
            });
            return;
        }

        await interaction.reply(
            interaction.targetMessage.content
                .split('\n')
                .map(l => convert(l, { stutter: true, tilde: false }))
                .join('\n')
        );
    }
}

export default new OwOCommand();