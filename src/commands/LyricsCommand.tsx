import { Container, Heading, LineBreak, Separator, SubText, TextDisplay } from '@reciple/jsx';
import { MessageFlags } from 'discord.js';
import lrclib, { type Track } from 'lrclib.js';
import { SlashCommandBuilder, SlashCommandModule, type SlashCommand } from 'reciple';

export class LyricsCommand extends SlashCommandModule {
    public data = new SlashCommandBuilder()
        .setName('lyrics')
        .setDescription('Find the lyrics of a song')
        .addSubcommand(search => search
            .setName('search')
            .setDescription('Search for a song by keywords')
            .addStringOption(option => option
                .setName('query')
                .setDescription('Search query for the song')
                .setRequired(true)
            )
        )
        .addSubcommand(track => track
            .setName('track')
            .setDescription('Get the lyrics of a specific track')
            .addStringOption(name => name
                .setName('name')
                .setDescription('Name of the track')
                .setRequired(true)
            )
            .addStringOption(artist => artist
                .setName('artist')
                .setDescription('Artist of the track')
                .setRequired(false)
            )
            .addStringOption(album => album
                .setName('album')
                .setDescription('Album of the track')
                .setRequired(false)
            )
        )
        .toJSON();

    public async execute({ interaction }: SlashCommand.ExecuteData): Promise<void> {
        const subcommand = interaction.options.getSubcommand();

        let track: Track|null = null;

        switch (subcommand) {
            case 'search':
                track = await lrclib
                    .search({
                        q: interaction.options.getString('query', true)
                    })
                    .then((tracks) => tracks[0] || null);
                break;
            case 'track':
                track = await lrclib
                    .search({
                        track_name: interaction.options.getString('name', true),
                        artist_name: interaction.options.getString('artist', false) || undefined,
                        album_name: interaction.options.getString('album', false) || undefined
                    })
                    .then((tracks) => tracks[0] || null);
                break;
        }

        if (!track) {
            await interaction.reply({
                flags: [MessageFlags.Ephemeral],
                content: 'No lyrics found for the specified query.'
            });
            return;
        }

        await interaction.reply({
            flags: [MessageFlags.IsComponentsV2],
            components: <>
                <Container>
                    <TextDisplay>
                        <Heading level={3}>{track.trackName}</Heading>
                        <LineBreak/>
                        <SubText>{track.albumName} • {track.artistName}</SubText>
                    </TextDisplay>
                    <Separator/>
                    <TextDisplay>
                        {track.plainLyrics}
                    </TextDisplay>
                </Container>
            </>
        });
    }
}

export default new LyricsCommand();