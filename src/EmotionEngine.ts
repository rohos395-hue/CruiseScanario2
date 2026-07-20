import { Client } from "@gradio/client";
import charactersJson from "./assets/characters.json";

export class EmotionEngine {

    private pipeline: any = null;
    private data: any;

    constructor() {
        this.data = charactersJson;
    }

    /**
     * Loads the GoEmotions model.
     */
    async load(state: any): Promise<boolean> {

        try {

            this.pipeline = await Client.connect(
                "lloorree/SamLowe-roberta-base-go_emotions"
            );

            state.log=state.log+"Emotion model loaded.";

            return true;

        } catch (err) {
    console.error(err);

    if (err instanceof Error) {
        state.log += "\nFailed to load emotion model:\n";
        state.log += err.message;
        state.log += "\n";
        state.log += err.stack ?? "";
    } else {
        state.log += "\n" + JSON.stringify(err);
    }

    return false;
        }
    }

    /**
     * Returns the raw classifier predictions.
     */
    async classify(text: string): Promise<any[]> {

        if (!this.pipeline)
            return [];

        try {

            const result = await this.pipeline.predict(
                "/predict",
                {
                    param_0: text
                }
            );

            return result.data;

        } catch (err) {

            console.warn("Emotion classification failed.", err);

            return [];
        }
    }

    /**
     * Applies the detected emotions to every character
     * currently present in the scene.
     */
    async applyToCharacters(
        state: any,
        charactersPresent: boolean[],
        profileName: string,
        text: string
    ): Promise<void> {
        state.log="in EE:";


        const predictions = await this.classify(text);
        state.log="in EE: "+predictions;

        const profile = this.data.emotionProfiles?.[profileName];

        if (!profile){
            state.log=state.log+"return0";
            return;}

        for (const prediction of predictions) {

            const emotion = prediction.label;
            const confidence = prediction.score;

            const deltas = profile[emotion];

            if (!deltas)
                continue;

            // Loop over every character
            for (let characterIndex = 0;
                 characterIndex < charactersPresent.length;
                 characterIndex++) {

                if (!charactersPresent[characterIndex])
                    continue;

                // Loop over every stat
                for (let statIndex = 0;
                     statIndex < deltas.length;
                     statIndex++) {

                    const statInfo = this.data.stats[statIndex];

                    if (!statInfo)
                        continue;

                    const stat =
                        state.characterStats[statInfo.name];

                    if (!stat)
                        continue;

                    stat.value[characterIndex] +=
                        deltas[statIndex] * confidence;

                    // Clamp
                    stat.value[characterIndex] = Math.max(
                        stat.min,
                        Math.min(
                            stat.max,
                            stat.value[characterIndex]
                        )
                    );
                }
            }
        }
    }

}
