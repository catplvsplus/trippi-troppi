import { Embed, EmbedAuthor, EmbedImage } from '@reciple/jsx';
import { ApplicationCommandType, GuildMember, MessageFlags, type ImageURLOptions } from 'discord.js';
import { ContextMenuCommand, ContextMenuCommandBuilder, ContextMenuCommandModule } from 'reciple';

export class AvatarCommand extends ContextMenuCommandModule {
    public data = new ContextMenuCommandBuilder()
        .setName('Avatar')
        .setType(ApplicationCommandType.User)
        .toJSON();

    public async execute({ interaction }: ContextMenuCommand.ExecuteData): Promise<void> {
        if (!interaction.isUserContextMenuCommand()) return;

        await interaction.deferReply({
            flags: [MessageFlags.Ephemeral]
        });

        const options: ImageURLOptions = { size: 1024, extension: 'webp' };

        const displayName: string = interaction.targetMember instanceof GuildMember
            ? interaction.targetMember.displayName
            : interaction.targetMember?.nick || interaction.targetUser.displayName;

        const avatarURL: string = interaction.targetMember?.avatar && interaction.inGuild()
            ? this.client.rest.cdn.guildMemberAvatar(interaction.guildId, interaction.targetId, interaction.targetMember.avatar, options)
            : interaction.targetUser.displayAvatarURL(options);

        await interaction.editReply({
            embeds: [
                <Embed color="Random" timestamp={Date.now()}>
                    <EmbedAuthor name={displayName}/>
                    <EmbedImage url={avatarURL}/>
                </Embed>
            ]
        });
    }
}

export default new AvatarCommand();