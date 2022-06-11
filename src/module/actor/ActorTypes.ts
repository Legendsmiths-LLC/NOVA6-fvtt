interface CharacterData {
    isTemplateActor: boolean;
}

interface CharacterActorData {
    type: "character";
    data: CharacterData;
}


export type ActorDataNOVA6 = CharacterActorData;
