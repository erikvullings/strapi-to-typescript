import { Xtestobject, Xtestobjectrelation, EnumXtestobjectenum_field } from './out3';
import { Xfile } from './out3/Xfile';
import { Xcomplex, EnumXcomplexvariant } from "./out3/content/Xcomplex";
import { Xsimple } from "./out3/content/Xsimple";
import { XWithDash } from "./out3/content/XWithDash";
import { XJustaCompleteOtherName } from "./out3/content/XJustaCompleteOtherName";

class XcomplexImpl implements Xcomplex {
    id: string;
    variant?: EnumXcomplexvariant;
    key?: string;
    single?: Xcomplex;
    repeatable: Xcomplex[];
    dynamic: (
        | ({ __component: 'content.complex' } & Xcomplex)
        | ({ __component: 'content.simple' } & Xsimple)
    )[];

    constructor(){
        this.id = "id";
        this.repeatable = [];
        this.dynamic = [];
    }
}

// implementation of Itestobject test required and type fields
class ItestobjectImpl implements Xtestobject {
    id: string;

    string_optional_field?: string;
    short_text_field: string;
    long_text_field: string;
    richtext_field: string;
    integer_field: number;
    big_integer_field: number;
    truncated_float_field: number;
    float_field: number;
    date_field: Date;
    datetime_field: any;
    time_field: any;
    boolean_field: boolean;
    email_field: string;
    password_field: string;
    enum_field: EnumXtestobjectenum_field;
    mulitple_media_field: any[];
    single_media_field?: Xfile;
    json_field: { [key: string]: any; };
    uid_field: any;
    created_by: string;
    component_complex: Xcomplex;
    component_complex_optional?: Xcomplex;
    component_complex_repeatable:Xcomplex[];
    dynamiczone: (
        | ({ __component: 'content.complex' } & Xcomplex)
        | ({ __component: 'content.simple' } & Xsimple)
        | ({ __component: 'content.camel-case' } & XWithDash)
        | ({ __component: 'content.another' } & XJustaCompleteOtherName)
    )[];

    testobjectrelation?: Xtestobjectrelation;
    testobjectrelations: Xtestobjectrelation[];

    constructor() {
        this.id = "id"
        this.short_text_field = "short_text";
        this.long_text_field = "long_text_field";
        this.richtext_field = "richtext_field";
        this.integer_field = 1;
        this.big_integer_field = 2;
        this.truncated_float_field = 3;
        this.float_field = 4;
        this.date_field = new Date();
        this.boolean_field = true;
        this.email_field = "email_field";
        this.password_field = "password_field";
        this.enum_field = EnumXtestobjectenum_field.enum1;
        this.json_field = {};
        this.created_by = "created_by";

        this.testobjectrelations = [];
        this.dynamiczone = [];

        // TOFII => any field

        this.mulitple_media_field = [];
        this.datetime_field = {};
        this.time_field = {};
        this.uid_field = {};

        this.component_complex = new XcomplexImpl();
        this.component_complex_repeatable = [];
    }
}

class ItestobjectrelationImpl implements Xtestobjectrelation {
    id: string;

    testobject_one_way?: Xtestobject;
    testobject_one_one?: Xtestobject;
    testobjects_one_many: Xtestobject[];
    testobject_many_one?: Xtestobject;
    testobjects_many_many: Xtestobject[];
    testobjects_poly: Xtestobject[];

    constructor(testobject: Xtestobject) {
        this.id = "id";
        this.testobjects_one_many = [testobject];
        this.testobjects_many_many = [testobject];
        this.testobjects_poly = [testobject];
    }
}

// test optional fields
const testobject = new ItestobjectImpl();
testobject.string_optional_field = "stringfieldoptional";

const testobjectrelation = new ItestobjectrelationImpl(testobject);
testobjectrelation.testobject_one_way = testobject;
testobjectrelation.testobject_one_one = testobject;
testobjectrelation.testobject_many_one = testobject;